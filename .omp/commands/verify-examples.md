---
name: verify-examples
description: Runs all Pike code examples through verification against Pike 8.0.1116
---

# Verify Examples

Extracts Pike code blocks from skill reference files and runs them through `pike-check-syntax` or `pike-evaluate` to verify they compile and produce expected output.

## Steps

1. Parse all `.md` files in `skills/` for Pike code blocks (```pike ... ```)
2. For each code block:
   a. Run `pike-check-syntax` to verify compilation
   b. If the block has expected output comments, run `pike-evaluate` and compare
3. Report PASS/FAIL for each example with file location
4. Summarize: X/Y examples passed
