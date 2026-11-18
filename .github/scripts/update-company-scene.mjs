import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})
const [hour, minute] = clock.format(new Date()).split(':').map(Number)
const time = hour + minute / 60
const schedule = JSON.parse(readFileSync('jc-tech/schedule.json', 'utf8'))
const scene = schedule.findLast(entry => time >= entry.from) ?? schedule.at(-1)
if (!scene || !/^[a-z-]+$/.test(scene.id)) throw new Error('Invalid JC Tech time slot')

const readmePath = 'README.md'
const readme = readFileSync(readmePath, 'utf8')
const section = /<!-- jc-tech:start -->[\s\S]*?<!-- jc-tech:end -->/g
if ([...readme.matchAll(section)].length !== 1) throw new Error('Expected one JC Tech profile section')
const updated = readme.replace(section, block => {
  for (const extension of ['svg', 'png']) {
    if (!existsSync('jc-tech/' + scene.id + '.' + extension)) throw new Error('Missing JC Tech image: ' + scene.id)
  }
  const imagePath = /\.\/jc-tech\/[a-z-]+\.(png|svg)"/g
  if ([...block.matchAll(imagePath)].length !== 2) throw new Error('Expected two JC Tech image paths')
  return block.replace(imagePath, (_, extension) => './jc-tech/' + scene.id + '.' + extension + '"')
})
if (updated !== readme) writeFileSync(readmePath, updated)
console.log('Beijing time ' + clock.format(new Date()) + ' · ' + scene.id)
