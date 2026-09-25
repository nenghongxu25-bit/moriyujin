# Material transition trial

forest.png and metadata are backups before this trial.
generated-bands.png is the built-in imagegen output; only its material-transition regions are used.
forest-transition.png is the composited production image, preserving original dimensions, 8px tile borders, center tiles, alpha and pixels outside the transition envelope.

Reproduce with tools/apply-forest-transition-bands.ps1 using forest.png and generated-bands.png as inputs. Restore forest.png to assets/tileset/forest/forest.png to undo. TileSet metadata and scene data need no rollback.
