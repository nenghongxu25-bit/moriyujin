# Forest terrain style update

Original production image: assets/tileset/forest/forest.png
Original atlas: 768 x 1152; 6 columns x 9 rows; 128 x 128 tiles.

forest.png, forest.png.meta, forest.tres, forest.tres.meta and forest.ls are pre-edit backups.
style-reference-generated.png is the built-in imagegen style draft. Its geometry drifted, so it was NOT installed as the production atlas.
forest-restyled.png retains every original pixel coordinate and alpha, applying only a deterministic color/brightness palette inspired by the generated style draft and current forest elements. No spatial filtering, resampling, new objects or texture redraw was applied.

The production replacement preserves the original atlas dimensions, tile regions, asset UUID and TileSet metadata. Restore forest.png from this directory to assets/tileset/forest/forest.png to undo the image change; no scene restore is needed.

Reproduction: tools/restyle-forest-atlas.ps1 with this directory's forest.png as Source and a new output path as Destination.
