<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

/* ------------------------------------------------------------------
 * 1. Refs & cleanup handles
 * ------------------------------------------------------------------ */
const canvasRef = ref<HTMLCanvasElement | null>(null)
let rafId = 0
let resizeHandler = () => {}

/* ------------------------------------------------------------------
 * 2. Animation bootstrap  (client-side only)
 * ------------------------------------------------------------------ */
onMounted(async () => {
  /* Wait one tick so <ClientOnly> has swapped in the real <canvas> */
  await nextTick()

  const c = canvasRef.value
  if (!c) return                              // HMR / safety
  const ctx = c.getContext('2d')!

  /* ---------- viewport-size helpers (called on load + resize) ------ */
  let w = 0, h = 0, hw = 0, hh = 0
  const setSize = () => {
    w = c.width  = window.innerWidth
    h = c.height = window.innerHeight
    hw = w / 2
    hh = h / 2
    ctx.font = `${opts.charSize}px Verdana`
  }

  /* ---------- original config -------------------------------------- */
  const opts = {
    strings: ['Happy', 'Birthday', 'My Love', 'Erlyn Joyce Ramos'],
    charSize: 30,
    charSpacing: 35,
    lineHeight: 40,

    cx: () => w / 2,                     // functions so they update on resize
    cy: () => h / 2,

    fireworkPrevPoints: 10,
    fireworkBaseLineWidth: 5,
    fireworkAddedLineWidth: 8,
    fireworkSpawnTime: 200,
    fireworkBaseReachTime: 30,
    fireworkAddedReachTime: 30,
    fireworkCircleBaseSize: 20,
    fireworkCircleAddedSize: 10,
    fireworkCircleBaseTime: 30,
    fireworkCircleAddedTime: 30,
    fireworkCircleFadeBaseTime: 10,
    fireworkCircleFadeAddedTime: 5,
    fireworkBaseShards: 5,
    fireworkAddedShards: 5,
    fireworkShardPrevPoints: 3,
    fireworkShardBaseVel: 4,
    fireworkShardAddedVel: 2,
    fireworkShardBaseSize: 3,
    fireworkShardAddedSize: 3,
    gravity: 0.1,
    upFlow: -0.1,
    letterContemplatingWaitTime: 360,
    balloonSpawnTime: 20,
    balloonBaseInflateTime: 10,
    balloonAddedInflateTime: 10,
    balloonBaseSize: 20,
    balloonAddedSize: 20,
    balloonBaseVel: 0.4,
    balloonAddedVel: 0.4,
    balloonBaseRadian: -(Math.PI / 2 - 0.5),
    balloonAddedRadian: -1,
  } as const

  const calc = {
    totalWidth: opts.charSpacing *
      Math.max(opts.strings[0].length, opts.strings[1].length)
  }

  const Tau        = Math.PI * 2
  const TauQuarter = Tau / 4
  const letters: any[] = []

  /* ------------------------------------------------------------------
   * 3. Classes  (verbatim from original script)
   * ------------------------------------------------------------------ */
  function Letter(this: any, char: string, x: number, y: number) {
    this.char = char
    this.x = x
    this.y = y

    this.dx = -ctx.measureText(char).width / 2
    this.dy = opts.charSize / 2

    this.reset()
  }

  Letter.prototype.reset = function () {
    this.phase = 'firework'
    this.tick = 0
    this.spawned = false
    this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0
    this.reachTime =
      (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) | 0
    this.lineWidth =
      opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random()
    this.prevPoints = [[0, hh, 0]]

    /* colors */
    const hue = (this.x / calc.totalWidth) * 360
    this.color          = `hsl(${hue},80%,50%)`
    this.lightAlphaColor= `hsla(${hue},80%,light%,alp)`
    this.lightColor     = `hsl(${hue},80%,light%)`
    this.alphaColor     = `hsla(${hue},80%,50%,alp)`

    /* helpers */
    this.fireworkDy = this.y - hh
  }

  Letter.prototype.step = function () {
    /* ---- FIREWORK PHASE ------------------------------------------ */
    if (this.phase === 'firework') {
      if (!this.spawned) {
        if (++this.tick >= this.spawningTime) {
          this.tick = 0
          this.spawned = true
        }
      } else {
        ++this.tick

        const lin  = this.tick / this.reachTime
        const arm  = Math.sin(lin * TauQuarter)
        const x    = lin * this.x
        const y    = hh + arm * this.fireworkDy

        if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift()
        this.prevPoints.push([x, y, lin * this.lineWidth])

        const lwProp = 1 / (this.prevPoints.length - 1)
        for (let i = 1; i < this.prevPoints.length; ++i) {
          const p1 = this.prevPoints[i]
          const p0 = this.prevPoints[i-1]
          ctx.strokeStyle = this.alphaColor.replace('alp', (i / this.prevPoints.length).toString())
          ctx.lineWidth = p1[2] * lwProp * i
          ctx.beginPath()
          ctx.moveTo(p1[0], p1[1])
          ctx.lineTo(p0[0], p0[1])
          ctx.stroke()
        }

        if (this.tick >= this.reachTime) {
          /* switch to contemplate */
          this.phase = 'contemplate'
          this.tick = this.tick2 = 0

          this.circleFinalSize =
            opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random()
          this.circleCompleteTime =
            (opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random()) | 0
          this.circleFadeTime =
            (opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random()) | 0
          this.circleCreating = true
          this.circleFading   = false

          /* shards */
          const shardCount = (opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random()) | 0
          const angle = Tau / shardCount, cos = Math.cos(angle), sin = Math.sin(angle)
          let vx = 1, vy = 0
          this.shards = []

          for (let i = 0; i < shardCount; ++i) {
            const vx1 = vx
            vx = vx * cos - vy * sin
            vy = vy * cos + vx1 * sin
            // eslint-disable-next-line new-cap
            this.shards.push(new Shard(this.x, this.y, vx, vy, this.alphaColor))
          }
        }
      }

    /* ---- CONTEMPLATE PHASE --------------------------------------- */
    } else if (this.phase === 'contemplate') {
      ++this.tick

      if (this.circleCreating) {
        ++this.tick2
        const prop = this.tick2 / this.circleCompleteTime
        const arm  = -Math.cos(prop * Math.PI) / 2 + 0.5

        ctx.fillStyle = this.lightAlphaColor
          .replace('light', (50 + 50 * prop).toString())
          .replace('alp', prop.toString())
        ctx.beginPath()
        ctx.arc(this.x, this.y, arm * this.circleFinalSize, 0, Tau)
        ctx.fill()

        if (this.tick2 >= this.circleCompleteTime) {
          this.tick2 = 0
          this.circleCreating = false
          this.circleFading   = true
        }

      } else if (this.circleFading) {
        ctx.fillStyle = this.lightColor.replace('light', '70')
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy)

        ++this.tick2
        const prop = this.tick2 / this.circleFadeTime
        const arm  = -Math.cos(prop * Math.PI) / 2 + 0.5

        ctx.fillStyle = this.lightAlphaColor
          .replace('light', '100')
          .replace('alp', (1 - arm).toString())
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau)
        ctx.fill()

        if (this.tick2 >= this.circleFadeTime) this.circleFading = false

      } else {
        ctx.fillStyle = this.lightColor.replace('light', '70')
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy)
      }

      /* step shards */
      for (let i = 0; i < this.shards.length; ++i) {
        this.shards[i].step()
        if (!this.shards[i].alive) { this.shards.splice(i, 1); --i }
      }

      /* switch to balloon */
      if (this.tick > opts.letterContemplatingWaitTime) {
        this.phase = 'balloon'
        this.tick = 0
        this.spawning   = true
        this.spawnTime  = (opts.balloonSpawnTime * Math.random()) | 0
        this.inflating  = false
        this.inflateTime= (opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random()) | 0
        this.size       = (opts.balloonBaseSize + opts.balloonAddedSize * Math.random()) | 0

        const rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random()
        const vel = opts.balloonBaseVel    + opts.balloonAddedVel    * Math.random()
        this.vx = Math.cos(rad) * vel
        this.vy = Math.sin(rad) * vel
      }

    /* ---- BALLOON PHASE ------------------------------------------- */
    } else if (this.phase === 'balloon') {
      ctx.strokeStyle = this.lightColor.replace('light', '80')

      if (this.spawning) {
        ++this.tick
        ctx.fillStyle = this.lightColor.replace('light', '70')
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy)
        if (this.tick >= this.spawnTime) {
          this.tick = 0
          this.spawning  = false
          this.inflating = true
        }

      } else if (this.inflating) {
        ++this.tick
        const prop = this.tick / this.inflateTime
        const x = this.cx = this.x
        const y = this.cy = this.y - this.size * prop

        ctx.fillStyle = this.alphaColor.replace('alp', prop.toString())
        ctx.beginPath()
        generateBalloonPath(x, y, this.size * prop)
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, this.y)
        ctx.stroke()

        ctx.fillStyle = this.lightColor.replace('light', '70')
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy)

        if (this.tick >= this.inflateTime) {
          this.tick = 0
          this.inflating = false
        }

      } else {
        this.cx += this.vx
        this.cy += (this.vy += opts.upFlow)

        ctx.fillStyle = this.color
        ctx.beginPath()
        generateBalloonPath(this.cx, this.cy, this.size)
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(this.cx, this.cy)
        ctx.lineTo(this.cx, this.cy + this.size)
        ctx.stroke()

        ctx.fillStyle = this.lightColor.replace('light', '70')
        ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size)

        if (this.cy + this.size < -hh || this.cx < -hw || this.cx > hw) {
          this.phase = 'done'
        }
      }
    }
  }

  function Shard(this: any, x:number, y:number, vx:number, vy:number, color:string) {
    const vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random()
    this.vx = vx * vel
    this.vy = vy * vel
    this.x  = x
    this.y  = y
    this.prevPoints = [[x, y]]
    this.color = color
    this.alive = true
    this.size  = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random()
  }

  Shard.prototype.step = function () {
    this.x += this.vx
    this.y += (this.vy += opts.gravity)

    if (this.prevPoints.length > opts.fireworkShardPrevPoints) this.prevPoints.shift()
    this.prevPoints.push([this.x, this.y])

    const lwProp = this.size / this.prevPoints.length
    for (let i = 0; i < this.prevPoints.length - 1; ++i) {
      const p0 = this.prevPoints[i]
      const p1 = this.prevPoints[i+1]
      ctx.strokeStyle = this.color.replace('alp', (i / this.prevPoints.length).toString())
      ctx.lineWidth = i * lwProp
      ctx.beginPath()
      ctx.moveTo(p0[0], p0[1])
      ctx.lineTo(p1[0], p1[1])
      ctx.stroke()
    }
    if (this.prevPoints[0][1] > hh) this.alive = false
  }

  function generateBalloonPath(x:number, y:number, size:number) {
    ctx.moveTo(x, y)
    ctx.bezierCurveTo(
      x - size / 2, y - size / 2,
      x - size / 4, y - size, x, y - size
    )
    ctx.bezierCurveTo(
      x + size / 4, y - size,
      x + size / 2, y - size / 2, x, y
    )
  }

  /* ------------------------------------------------------------------
   * 4. Populate letters & kick RAF
   * ------------------------------------------------------------------ */
  opts.strings.forEach((row, i) => {
    for (let j = 0; j < row.length; ++j) {
      // eslint-disable-next-line new-cap
      letters.push(new Letter(
        row[j],
        j * opts.charSpacing + opts.charSpacing / 2 - (row.length * opts.charSize) / 2,
        i * opts.lineHeight + opts.lineHeight / 2 - (opts.strings.length * opts.lineHeight) / 2
      ))
    }
  })

  const anim = () => {
    rafId = requestAnimationFrame(anim)

    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, w, h)

    ctx.translate(hw, hh)
    let done = true
    letters.forEach(l => { l.step(); if (l.phase !== 'done') done = false })
    ctx.translate(-hw, -hh)

    if (done) letters.forEach(l => l.reset())
  }
  anim()

  /* resize responsiveness */
  setSize()
  resizeHandler = () => setSize()
  window.addEventListener('resize', resizeHandler)
})

/* ------------------------------------------------------------------ */
onUnmounted(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resizeHandler)
})
</script>

<template>
  <!-- full-screen wrapper, Tailwind prefix `tw-` -->
  <ClientOnly>
    <div class="tw-fixed tw-inset-0 tw-w-full tw-h-screen tw-overflow-hidden tw-pointer-events-none">
      <canvas
        ref="canvasRef"
        class="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-block"
      />
    </div>
  </ClientOnly>
</template>

<style>
/* prevent scrollbars globally */
body { overflow: hidden; }
</style>
