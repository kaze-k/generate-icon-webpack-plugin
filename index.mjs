import ora from "ora"
import logSymbols from "log-symbols"
import process from "child_process"
import fs from "fs"
import path from "path"

const useExec = () => {
  return new Promise((resolve, reject) => {
    process.exec(`tsc && babel src -d dist -x ".ts"`, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      }

      resolve({
        stdout,
        stderr,
      })
    })
  })
}

const removeDir = (dir) => {
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const newPath = path.join(dir, file)
    const stat = fs.statSync(newPath)
    if (stat.isDirectory()) {
      removeDir(newPath)
    } else {
      fs.unlinkSync(newPath)
    }
  })
  fs.rmdirSync(dir)
}

const main = async () => {
  const spinner = ora("编译中").start()

  if (fs.existsSync("./dist")) {
    removeDir("./dist")
  }

  try {
    await useExec()
    spinner.stop()
    console.log(logSymbols.success, "编译完成")
  } catch (err) {
    spinner.stop()
    console.log(logSymbols.error, err)
  }
}

main()
