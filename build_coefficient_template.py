import html
import re
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def read_rows(path: Path):
    with zipfile.ZipFile(path) as z:
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall("a:si", NS):
                shared.append("".join(t.text or "" for t in si.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t")))
        root = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))

        def col_index(ref: str):
            match = re.match(r"[A-Z]+", ref or "A")
            value = 0
            for ch in match.group(0):
                value = value * 26 + ord(ch) - 64
            return value - 1

        def cell_value(cell):
            cell_type = cell.attrib.get("t")
            if cell_type == "inlineStr":
                return "".join(t.text or "" for t in cell.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t"))
            value = cell.find("a:v", NS)
            raw = "" if value is None or value.text is None else value.text
            if cell_type == "s":
                return shared[int(raw)] if raw else ""
            return raw

        rows = []
        for row in root.findall(".//a:sheetData/a:row", NS):
            temp = {}
            max_col = -1
            for cell in row.findall("a:c", NS):
                idx = col_index(cell.attrib.get("r"))
                temp[idx] = cell_value(cell)
                max_col = max(max_col, idx)
            if max_col >= 0:
                rows.append([temp.get(i, "") for i in range(max_col + 1)])
        return rows


def num(value):
    if value is None or value == "":
        return ""
    try:
        parsed = float(str(value).strip())
        return int(parsed) if parsed.is_integer() else parsed
    except ValueError:
        return str(value)


def quoted(value: str):
    return '"' + value.replace('"', '""') + '"'


def normalize_attr(attr: str):
    return "\u504f\u659c" if attr == "\u95ea\u907f" else attr


def col_name(index: int):
    result = ""
    index += 1
    while index:
        index, rem = divmod(index - 1, 26)
        result = chr(65 + rem) + result
    return result


def cell_xml(value, row: int, col: int):
    ref = f"{col_name(col)}{row}"
    if isinstance(value, tuple) and value[0] == "formula":
        return f'<c r="{ref}"><f>{html.escape(value[1])}</f></c>'
    if value is None or value == "":
        return f'<c r="{ref}"/>'
    if isinstance(value, (int, float)):
        return f'<c r="{ref}"><v>{value}</v></c>'
    return f'<c r="{ref}" t="inlineStr"><is><t>{html.escape(str(value))}</t></is></c>'


def sheet_xml(data):
    max_cols = max(len(row) for row in data)
    rows_xml = []
    for row_idx, row in enumerate(data, 1):
        rows_xml.append(f'<row r="{row_idx}">' + "".join(cell_xml(value, row_idx, col_idx) for col_idx, value in enumerate(row)) + "</row>")
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f'<dimension ref="A1:{col_name(max_cols - 1)}{len(data)}"/>'
        '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
        '<sheetFormatPr defaultRowHeight="15"/><sheetData>'
        + "".join(rows_xml)
        + "</sheetData></worksheet>"
    )


def sumifs(sheet, col, criteria_col, criteria):
    return f"SUMIFS({sheet}!${col}:${col},{sheet}!${criteria_col}:${criteria_col},{criteria})"


def standard(col: str, attr: str):
    return f'SUMIFS(StandardParams!${col}:${col},StandardParams!$B:$B,{quoted(attr)})'


def coeff(col: str, role_cell: str, attr: str):
    return (
        f'SUMIFS(Coefficients!${col}:${col},Coefficients!$A:$A,${role_cell},'
        f'Coefficients!$B:$B,{quoted(attr)})'
    )


def param_value(row: int, attr: str, standard_col: str, coeff_col: str):
    role_cell = f"B{row}"
    return f"{standard(standard_col, attr)}*IFERROR({coeff(coeff_col, role_cell, attr)},1)"


def equip_sum(row: int, attr: str):
    return (
        f'SUMIFS(EquipPlans!$I:$I,EquipPlans!$A:$A,$C{row},'
        f'EquipPlans!$B:$B,{quoted(attr)})'
    )


def base_attr_value(row: int, attr: str):
    return (
        f'IF($A{row}="","",'
        f'{param_value(row, attr, "C", "C")}+'
        f'{param_value(row, attr, "D", "D")}*'
        f'SUMIFS(TestCases!$D:$D,TestCases!$A:$A,$A{row})*'
        f'{param_value(row, attr, "E", "E")}+'
        f'{param_value(row, attr, "F", "F")})'
    )


def stat_base(row: int, attr: str):
    return (
        f'{param_value(row, attr, "C", "C")}+'
        f'{param_value(row, attr, "D", "D")}*'
        f'SUMIFS(TestCases!$D:$D,TestCases!$A:$A,$A{row})+'
        f'{param_value(row, attr, "F", "F")}+'
        f'{equip_sum(row, attr)}'
    )


def main():
    src = next(
        p
        for p in Path(".").glob("*.xlsx")
        if not p.name.startswith("~$")
        and p.name not in {"role_balance_template.xlsx", "role_balance_coeff_template.xlsx"}
        and not p.name.endswith("_long.xlsx")
    )
    rows = read_rows(src)
    role = rows[0][1] if len(rows[0]) > 1 else "\u9752\u69d0"
    level = num(rows[1][2]) if len(rows) > 1 and len(rows[1]) > 2 else 100

    base_attrs = ["\u81c2\u529b", "\u6280\u5de7", "\u6839\u9aa8", "\u5185\u606f", "\u8eab\u6cd5", "\u5b9a\u529b"]
    base_cat = "\u57fa\u7840\u5c5e\u6027"
    skipped_cats = {"\u6b66\u5b66\u8d44\u8d28", "\u5c5e\u6027\u8d44\u8d28"}
    qual_by_attr = {}
    for i, attr in enumerate(base_attrs, start=31):
        if len(rows) > i and len(rows[i]) > 2:
            qual_by_attr[attr] = num(rows[i][2])

    standard_rows = [["\u5c5e\u6027\u5206\u7c7b", "\u5c5e\u6027\u540d", "\u57fa\u7840\u6570\u503c", "\u6210\u957f/\u7ea7", "\u8d44\u8d28", "\u7ecf\u8109"]]
    category = ""
    for row in rows[2:]:
        if len(row) > 0 and str(row[0]).strip():
            category = str(row[0]).strip()
        attr = normalize_attr(str(row[1]).strip()) if len(row) > 1 and row[1] != "" else ""
        if not attr or category in skipped_cats:
            continue
        qual = qual_by_attr.get(attr, "") if category == base_cat else ""
        standard_rows.append([
            category,
            attr,
            num(row[2]) if len(row) > 2 else "",
            num(row[3]) if len(row) > 3 else "",
            qual,
            num(row[4]) if len(row) > 4 else "",
        ])

    coefficient_rows = [["\u89d2\u8272", "\u5c5e\u6027\u540d", "\u57fa\u7840\u6570\u503c\u7cfb\u6570", "\u6210\u957f\u7cfb\u6570", "\u8d44\u8d28\u7cfb\u6570", "\u7ecf\u8109\u7cfb\u6570"]]
    for role_name in [role, "\u65b0\u89d2\u8272"]:
        for row in standard_rows[1:]:
            coefficient_rows.append([role_name, row[1], 1, 1, 1, 1])

    equip_rows = [["\u88c5\u5907\u65b9\u6848", "\u5c5e\u6027\u540d", "\u6b66\u5668", "\u62a4\u7532", "\u62a4\u8170", "\u62a4\u8155", "\u6212\u6307", "\u540a\u5760", "\u88c5\u5907\u5408\u8ba1"]]
    for row in rows[2:19]:
        attr = normalize_attr(str(row[1]).strip()) if len(row) > 1 and row[1] != "" else ""
        if not attr:
            continue
        equip = [num(row[i]) if len(row) > i else "" for i in range(5, 11)]
        if any(value != "" for value in equip):
            excel_row = len(equip_rows) + 1
            equip_rows.append(["\u6807\u51c6\u6d4b\u8bd5\u88c5", attr] + equip + [("formula", f"SUM(C{excel_row}:H{excel_row})")])

    test_rows = [
        ["\u6d4b\u8bd5ID", "\u89d2\u8272", "\u88c5\u5907\u65b9\u6848", "\u7b49\u7ea7", "\u5907\u6ce8"],
        ["T001", role, "\u6807\u51c6\u6d4b\u8bd5\u88c5", level, "\u57fa\u51c6"],
        ["T002", "\u65b0\u89d2\u8272", "\u6807\u51c6\u6d4b\u8bd5\u88c5", level, "\u4fee\u6539\u7cfb\u6570\u770b\u53d8\u5316"],
    ]

    attrs = base_attrs + [
        "\u653b\u51fb", "\u9632\u5fa1", "\u901f\u5ea6", "\u547d\u4e2d", "\u62db\u67b6", "\u504f\u659c",
        "\u62b5\u6297", "\u97e7\u6027",
        "\u6c14\u8840", "\u5185\u529b", "\u5185\u529b\u56de\u590d", "\u6c14\u8840\u6062\u590d",
        "\u62db\u67b6\u7387", "\u504f\u659c\u7387", "\u9632\u5fa1\u514d\u4f24\u7387",
    ]
    result_rows = [["\u6d4b\u8bd5ID", "\u89d2\u8272", "\u88c5\u5907\u65b9\u6848"] + attrs]
    attack, defense, speed, hit, parry, dodge, resistance, toughness, hp, mp, mp_regen, hp_regen = attrs[6:18]
    for row in range(2, 22):
        formulas = [
            f'IF(TestCases!A{row}="","",TestCases!A{row})',
            f'IF($A{row}="","",TestCases!B{row})',
            f'IF($A{row}="","",TestCases!C{row})',
        ]
        formulas += [base_attr_value(row, attr) for attr in base_attrs]
        formulas += [
            f'IF($A{row}="","",{stat_base(row, attack)}+D{row}*4)',
            f'IF($A{row}="","",{stat_base(row, defense)})',
            f'IF($A{row}="","",{stat_base(row, speed)}+H{row}*2)',
            f'IF($A{row}="","",{stat_base(row, hit)}+E{row}*2)',
            f'IF($A{row}="","",{stat_base(row, parry)}+E{row}*2)',
            f'IF($A{row}="","",{stat_base(row, dodge)}+H{row}*2)',
            f'IF($A{row}="","",{stat_base(row, resistance)}+I{row}*2.5)',
            f'IF($A{row}="","",{stat_base(row, toughness)}+F{row})',
            f'IF($A{row}="","",{stat_base(row, hp)}+F{row}*20)',
            f'IF($A{row}="","",{stat_base(row, mp)}+G{row}*10)',
            f'IF($A{row}="","",{stat_base(row, mp_regen)}+G{row}*0.5)',
            f'IF($A{row}="","",{stat_base(row, hp_regen)})',
            f'IF($A{row}="","",L{row}/(N{row}+L{row}+500))',
            f'IF($A{row}="","",M{row}/(O{row}+M{row}+500))',
            f'IF($A{row}="","",K{row}/(J{row}+K{row}))',
        ]
        result_rows.append([("formula", formula) for formula in formulas])

    sheets = [
        ("StandardParams", standard_rows),
        ("Coefficients", coefficient_rows),
        ("EquipPlans", equip_rows),
        ("TestCases", test_rows),
        ("Results", result_rows),
    ]
    out = Path("role_balance_coeff_template.xlsx")
    if out.exists():
        out.unlink()

    content_types = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        + "".join(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' for i in range(1, 6))
        + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
        '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
        "</Types>"
    )
    rels_root = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
        '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>'
        "</Relationships>"
    )
    workbook = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
        + "".join(f'<sheet name="{name}" sheetId="{idx}" r:id="rId{idx}"/>' for idx, (name, _) in enumerate(sheets, 1))
        + '</sheets><calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/></workbook>'
    )
    workbook_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + "".join(f'<Relationship Id="rId{idx}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{idx}.xml"/>' for idx in range(1, 6))
        + '<Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
    )
    styles = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>'
        '<fills count="1"><fill><patternFill patternType="none"/></fill></fills>'
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>'
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'
    )
    now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    core = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" '
        'xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        f'<dc:creator>Codex</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>'
        f'<dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified></cp:coreProperties>'
    )
    app = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'
        "<Application>Codex</Application></Properties>"
    )
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", rels_root)
        z.writestr("xl/workbook.xml", workbook)
        z.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        z.writestr("xl/styles.xml", styles)
        z.writestr("docProps/core.xml", core)
        z.writestr("docProps/app.xml", app)
        for idx, (_, data) in enumerate(sheets, 1):
            z.writestr(f"xl/worksheets/sheet{idx}.xml", sheet_xml(data))

    print(out.resolve())
    print("standard_rows", len(standard_rows) - 1, "coefficient_rows", len(coefficient_rows) - 1)


if __name__ == "__main__":
    main()
