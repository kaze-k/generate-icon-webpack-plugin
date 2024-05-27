import ora from "ora"
import logSymbols from "log-symbols"
import process from "child_process"
import fs from "fs"
import path from "path"

const useExec = (command) => {
  return new Promise((resolve, reject) => {
    process.exec(command, (err, stdout, stderr) => {
      if (err) {
        reject({
          err,
          stdout,
          stderr,
        })
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
    const { stdout: tscStdout, stderr: tscStderr } = await useExec(`tsc`)
    if (tscStdout) console.info("\n", tscStdout)
    if (tscStderr) console.error("\n", tscStderr)

    const { stdout: babelStdout, stderr: babelStderr } = await useExec(`babel src -d dist -x ".ts"`)
    spinner.stop()
    console.log(logSymbols.success, "编译完成")
    if (babelStdout) console.info("\n", babelStdout)
    if (babelStderr) console.error("\n", babelStderr)
  } catch (err) {
    spinner.stop()
    console.error(logSymbols.error, err.err)
    console.info(err.stdout)
    console.info(err.stderr)
  }
}

main()
