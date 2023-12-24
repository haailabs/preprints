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

  function generateColor(hash: number): string {
    const color = `#${Math.abs(hash).toString(12).substr(0, 6)}`
    return color
  }

  function generateVectorField(
    hash: number,
    width: number,
    height: number
  ): string {
    var size = Math.min(width, height) // Use the smaller of width and height
    var step = 8
    var lines = []

    // Linear congruential generator (LCG) for pseudo-randomness
    var a = 1664525
    var c = 1013904223
    var m = Math.pow(2, 32)

    // Seed with the hash
    var pseudoRandom = () => {
      hash = (a * hash + c) % m
      return hash / m
    }

    // Create the lines with variance
    for (var i = step; i <= size - step; i += step) {
      var line = []
      for (var j = step; j <= size - step; j += step) {
        var distanceToCenter = Math.abs(j - size / 2)
        var variance = Math.max(size / 2 - 50 - distanceToCenter, 0)
        var random = ((pseudoRandom() * variance) / 2) * -1 // Use pseudoRandom instead of Math.random
        var point = { x: j, y: i + random }
        line.push(point)
      }
      lines.push(line)
    }

    // Begin SVG string
    var svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`

    // Convert canvas drawing to SVG path
    for (var i = 5; i < lines.length; i++) {
      var pathData = `M ${lines[i][0].x} ${lines[i][0].y} `

      for (var j = 0; j < lines[i].length - 1; j++) {
        var xc = (lines[i][j].x + lines[i][j + 1].x) / 2
        var yc = (lines[i][j].y + lines[i][j + 1].y) / 2
        pathData += `Q ${lines[i][j].x} ${lines[i][j].y}, ${xc} ${yc} `
      }

      // Last curve to the last point
      pathData += `T ${lines[i][lines[i].length - 1].x} ${
        lines[i][lines[i].length - 1].y
      }`

      // Add path to SVG
      svg += `<path d="${pathData}" fill="none" stroke="black" stroke-width="2"/>`
    }

    // Close SVG string
    svg += '</svg>'

    return svg
  }

  const hash = hashString(title)
  const width = 250
  const height = 200

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      ${generateVectorField(hash, width, height)}
   
    </svg>
  `

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

import React, { ReactElement } from 'react'
import Link from 'next/link'
// import Dotdotdot from 'react-dotdotdot';
import Price from '@shared/Price'
// import removeMarkdown from 'remove-markdown';
// import Publisher from '@shared/Publisher';
// import AssetType from '@shared/AssetType';
// import NetworkName from '@shared/NetworkName';
import styles from './AssetTeaser.module.css'
// import { getServiceByName } from '@utils/ddo';
import cx from 'classnames'

declare type AssetTeaserProps = {
  asset: AssetExtended
  // noPublisher?: boolean;
  trendingList?: boolean
}

export default function AssetTeaser({
  asset,
  // noPublisher,
  trendingList
}: AssetTeaserProps): ReactElement {
  const { name, author, additionalInformation, tags } = asset.metadata

  // Combine all relevant data into a single object for iteration
  const fields = {
    ...additionalInformation,
    tags
  }
  if (tags) {
    fields.tags = tags[0]
  }
  return (
    <article
      className={cx(styles.teaser, trendingList && styles.trendingAsset)}
    >
      <div className={styles.container}>
        <Link href={`/asset/${asset.id}`}>
          <a className={styles.link}>
            <div>
              {additionalInformation.coverPicture ? (
                <img
                  src={additionalInformation.coverPicture}
                  alt="Cover Picture"
                  style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                />
              ) : (
                <img
                  src={generatePlaceholderUrl(name)}
                  alt="Placeholder Image"
                  style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                />
              )}
            </div>
            <div>
              <h2>{name}</h2>
              {author && <p>{author}</p>}
              {Object.entries(fields).map(([key, value]) => {
                if (
                  ['album', 'category', 'coverPicture', 'title'].includes(key)
                ) {
                  return null // Skip rendering for excluded keys
                }

                // Check if the value is an array
                if (Array.isArray(value)) {
                  return (
                    <p key={key}>
                      {' '}
                      {value.map((item) => (
                        <span key={`${key}-${item}`} className={styles.tag}>
                          {item}
                        </span>
                      ))}
                    </p>
                  )
                }

                // Handle strings and numbers as before
                if (typeof value === 'string') {
                  if (key === 'tags') {
                    // Separate comma-separated values into an array
                    const tagsArray = value.split(',').map((tag) => tag.trim())
                    // Render the tags as a list separated by semicolons
                    return (
                      <p key={key}>
                        {tagsArray.map((tag, index) => (
                          <React.Fragment key={tag}>
                            {index > 0 && '; '}
                            <span className={styles.tag}>{tag}</span>
                          </React.Fragment>
                        ))}
                      </p>
                    )
                  } else {
                    return <p key={key}>{value}</p>
                  }
                } else if (typeof value === 'number') {
                  return (
                    <p key={key}>
                      <strong>{key}:</strong> {value}
                    </p>
                  )
                } else {
                  console.warn(
                    `Unsupported type for field ${key}: ${typeof value}`
                  )
                }
              })}

              <div className={styles.priceInfoMobile}>
                <Price accessDetails={asset.accessDetails} size="small" />
              </div>
              <div>
                <Price accessDetails={asset.accessDetails} size="small" />
              </div>
            </div>
          </a>
        </Link>
      </div>
    </article>
  )
}
