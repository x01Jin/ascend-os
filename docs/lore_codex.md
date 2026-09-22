# Lore codex

The Lore tab of the completion window catalogs what the tree says about the decompression. Canon lives in `references/lore/`; this page describes how it surfaces in play.

## Entry format

Every entry shows a catalog ID, an in-world source path, and a layer; a verbatim excerpt opening with a channel tag (`[BOOT LOG-01]`, `[TRAIL TRC-2]`, `[HOLD VLT-07]`); one redaction, contradiction, or gap; sideways refs to entries sharing a tag, ID, name, or quoted phrase; and an unresolved closing line. Entries never summarize their own file, explain another entry, or conclude.

## Catalog and board

The tab has two views. **Catalog** lists all 31 entries; unseen ones render sealed. Ref chips jump sideways to the linked entry. **Board** pins the seven open questions, each fed by two or three clues from different files and mouths, plus six residue threads naming the overlaps. Nothing resolves at 100%.

## Award triggers

| Entry                            | Trigger                                                                   |
| -------------------------------- | ------------------------------------------------------------------------- |
| LOG-01, LOG-02                   | boot completes                                                            |
| LOG-03                           | any manifest log read                                                     |
| LOG-05, OPR-06, OPR-07           | node list, tally, lock note read (layers 4+)                              |
| LOG-06                           | entering a `cache_*` folder                                               |
| LOG-07, OPR-12, OPR-13           | terminal host log and margin reads                                        |
| LOG-08                           | every ascend completes                                                    |
| OPR-02                           | `archivist_2` read (travels beside TRC-2)                                 |
| OPR-03                           | manifest claim note read                                                  |
| OPR-08                           | map margin read                                                           |
| OPR-09                           | ghost margin read                                                         |
| OPR-10                           | index note read (layer 2)                                                 |
| OPR-11                           | capacity note read (layer 5+)                                             |
| TRC-1–5                          | trail part read (`lore_archivist_N` also gates ascend)                    |
| VLT-05, VLT-07, VLT-12           | hold vault unlock                                                         |
| OPR-04, modules                  | package open, module install                                              |
| Offering, decay, penalty, ending | offering TRACE, layer-2 arrival, redundant rescan, trail-cache order kept |

## Ghost passwords

Each layer's ghost margin names a password shaped as a path (`/holds/NN/README`) pointing at the next layer's hold, plus the folder holding the current sealed vault. The unlock box compares case-insensitively; the ghost file is the canonical source.
