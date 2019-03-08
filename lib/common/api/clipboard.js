'use strict'

const clipboard = process.atomBinding('clipboard')

if (process.type === 'renderer') {
  const ipcRendererUtils = require('@electron/internal/renderer/ipc-renderer-internal-utils')
  const clipboardUtils = require('@electron/internal/common/clipboard-utils')

  const makeRemoteMethod = function (method) {
    return (...args) => {
      args = clipboardUtils.serialize(args)
      const result = ipcRendererUtils.invokeSync('ELECTRON_BROWSER_CLIPBOARD', method, ...args)
      return clipboardUtils.deserialize(result)
    }
  }

  if (process.platform === 'linux') {
    // On Linux we could not access clipboard in renderer process.
    for (const method of Object.keys(clipboard)) {
      clipboard[method] = makeRemoteMethod(method)
    }
  } else if (process.platform === 'darwin') {
    // Read/write to find pasteboard over IPC since only main process is notified of changes
    clipboard.readFindText = makeRemoteMethod('readFindText')
    clipboard.writeFindText = makeRemoteMethod('writeFindText')
  }
}

module.exports = clipboard
