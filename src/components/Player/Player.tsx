function generatePlaceholderUrl(title: string): string {
  function hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash
  }

  function generateVectorField(
    hash: number,
    width: number,
    height: number
  ): string {
    let terrain = ''
    const step = 20 // Distance between points, adjust for finer detail

    // Function to generate height based on position and hash
    // Incorporating symmetry by reflecting the x-coordinate around the central axis
    const generateHeight = (x: number, y: number) => {
      let mirroredX = width / 2 - Math.abs(x - width / 2)
      return (
        (Math.sin((mirroredX + hash) * 0.2) + Math.cos((y + hash) * 0.02)) * 50
      )
    }

    // Function to generate color based on height
    const generateColor = (height: number) => {
      let colorValue = 128 + height // Simple gradient effect
      return `rgb(${colorValue % 255},${(colorValue * 2) % 255},${
        (colorValue * 3) % 255
      })`
    }

    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < height; y += step) {
        const h1 = generateHeight(x, y)
        const h2 = generateHeight(x + step, y)
        const h3 = generateHeight(x + step, y + step)
        const h4 = generateHeight(x, y + step)

        // Create two triangles for each square to form the terrain
        terrain += `<polygon points="${x},${y},${h1} ${x + step},${y},${h2} ${
          x + step
        },${y + step},${h3}" style="fill:${generateColor(
          h1
        )};stroke:${generateColor(h2)};stroke-width:1"/>`
        terrain += `<polygon points="${x},${y},${h1} ${x + step},${
          y + step
        },${h3} ${x},${y + step},${h4}" style="fill:${generateColor(
          h3
        )};stroke:${generateColor(h4)};stroke-width:1"/>`
      }
    }
    return terrain
  }

  const hash = hashString(title)
  const width = 800
  const height = 500

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      ${generateVectorField(hash, width, height)}
   
    </svg>
  `

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
import { usePlayerContext } from '@context/Player.context'
import useWindowDimensions from '@hooks/useWindowDimensions'
import React, { ReactElement } from 'react'
import AudioPlayer from 'react-h5-audio-player'

import styles from './Player.module.css'

export default function Player(): ReactElement {
  const { song, loading, close, songData } = usePlayerContext()
  const { width } = useWindowDimensions()

  const player = (
    <div className={styles.playerWrapper}>
      <img
        style={{ margin: 0 }}
        width={70}
        height={70}
        src={
          songData?.coverPicture ??
          generatePlaceholderUrl(songData?.title ?? 'default')
        }
        alt="cover"
        className={styles.playerCover}
      />
      <AudioPlayer
        src={song}
        layout={width > 600 ? 'horizontal' : 'stacked'}
        autoPlay
        showJumpControls={false}
        className={styles.audioPlayer}
        header={
          <div className={styles.songDetails}>
            {/* <div>album: {songData?.album}</div> */}
            <div>
              <h4 className={styles.songTitle}>{songData?.title}</h4>
              <div>{songData?.artist}</div>
            </div>
          </div>
        }
      />
    </div>
  )

  if (!song) {
    return null
  }

  if (loading) {
    return (
      <div className={styles.loadingRoot}>
        <div className={styles.loadingPlayer}>{player}</div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.closeContainer}>
        <button className={styles.closeButton} onClick={close}>
          ✖
        </button>
      </div>

      {player}
    </div>
  )
}
