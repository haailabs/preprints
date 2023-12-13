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
                  src="/placeholderImage.jpg"
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
