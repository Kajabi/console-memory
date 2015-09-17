consoleMemory
=============

This global function lets you retrieve previous `console.log` and
`console.error` outputs in a stringified format.

# Signature
    consoleMemory(outputName[, from[, howMany]][, breakDownLines])

# Examples
## Output all memorized `console.log` actions
    consoleMemory('log');
## Output all memorized `console.error` actions and break down each output line
    consoleMemory('error', true);
## Output last 3 memorized `console.error` actions
    consoleMemory('error', -3);
## Output every memorized `console.error` actions from the 5th
    consoleMemory('error', 5);
## Output 3 memorized `console.error` actions from the 5th
    consoleMemory('error', 5, 3);
## Output 3 memorized `console.error` actions starting from the action that was 5th from the last and break down each output line
    consoleMemory('error', -5, 3, true);

# How it works
This works by installing proxy functions that replace the original
console methods. The proxy functions stringify and push the received
arguments to a private variable and pass the original arguments to the
real console method (so your console keeps working just the way it used to).

# Is this tested?
Check out our [test page](https://kajabi.github.io/console-memory/test.html).
