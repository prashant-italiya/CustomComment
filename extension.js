const vscode = require('vscode');

/**
 * This function toggles `//` comments for the currently selected lines in the active text editor.
 */
function toggleComment() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active');
        return;
    }

    const tabSize = typeof editor.options.tabSize === 'number' ? editor.options.tabSize : 4;  // Default to 4 if undefined

    editor.edit(editBuilder => {
        editor.selections.forEach(selection => {
            // Process each line in the selection
            for (let line = selection.start.line; line <= selection.end.line; line++) {
                const textLine = editor.document.lineAt(line);
                const text = textLine.text;
                const trimmedText = text.trim();
				const currentIndent = text.length - text.trimStart().length;
				const position = new vscode.Position(line, currentIndent);

                if (trimmedText.startsWith('//')) {
                    // Remove comment
                    const uncommentIndex = text.indexOf('//');
                    const uncommentText = text.substring(0, uncommentIndex) + text.substring(uncommentIndex + 2);
                    const newText = uncommentText.replace(/^\s*\/\//, '');
                    console.log('newText1:', newText);
                    const leadingSpaces = text.substring(0, uncommentIndex).match(/^\s*/)[0];
                    const newIndentSize = Math.floor(leadingSpaces.length / tabSize) * tabSize;  // Calculate new indentation

                    editBuilder.replace(textLine.range, newText);
                    // Optionally, adjust cursor position
                    const newPosition = new vscode.Position(line, newIndentSize);
                    editor.selection = new vscode.Selection(newPosition, newPosition);
                } else {
                    // Add comment
                    editBuilder.insert(new vscode.Position(line, 0), '//');
                }
            }
        });

        // Move cursor to the next line after the last selection
        const lastSelection = editor.selections[editor.selections.length - 1];
        const nextLinePos = lastSelection.end.line + 1 < editor.document.lineCount ? 
            new vscode.Position(lastSelection.end.line + 1, 0) : 
            new vscode.Position(lastSelection.end.line, 0);
        editor.selection = new vscode.Selection(nextLinePos, nextLinePos);
    });
}

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.toggleComment', toggleComment);
    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
