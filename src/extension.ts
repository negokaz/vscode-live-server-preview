'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as liveServer from 'live-server';
import * as path from 'path';
import LiveServerContentProvider from './LiveServerContentProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.registerTextDocumentContentProvider('LiveServerPreview', new LiveServerContentProvider());
    let disposablePreview = vscode.commands.registerTextEditorCommand('extension.liveServerPreview.open', livePreview);
    context.subscriptions.push(disposablePreview);
}

function livePreview(textEditor: vscode.TextEditor) {

    if (!isEditingHTML(textEditor.document)) {
        vscode.window.showErrorMessage('Live Server Preview can preview only HTML file');
        return;
    }

    const workspacePath = 
        vscode.workspace.rootPath;
    const documentPath = 
        textEditor.document.uri.fsPath;

    const rootPath =
        // workspace is available and it has the document
        (workspacePath && documentPath.startsWith(workspacePath))
            ? workspacePath 
            : path.dirname(documentPath);

    liveServer.start({
        port: 0, // random port
        host: '127.0.0.1',
        root: rootPath,
        open: false
    });

    // some/file.html
    const relativePath = documentPath.substr(rootPath.length + 1);
    const previewUri =
        vscode.Uri.parse(`LiveServerPreview://authority/${relativePath}`);

    vscode.commands
            .executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two)
            .then(s => console.log('done'), vscode.window.showErrorMessage);
}

function isEditingHTML(document: vscode.TextDocument) {
    return document.languageId.toLowerCase() == 'html' || document.fileName.match(/\.html$/);
}

// this method is called when your extension is deactivated
export function deactivate() {
    liveServer.shutdown();
}
