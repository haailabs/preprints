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
    const color = `#${Math.abs(hash).toString(9).substr(0, 4)}`
    return color
  }

  function generateVectorField(
    hash: number,
    width: number,
    height: number
  ): string {
    let field = ''
    const step = 5 // Distance between lines
    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < height; y += step) {
        const angle =
          (Math.cos((x + hash) * 0.1) + Math.sin((y + hash) * 0.1)) * Math.PI
        const lineLength = 5
        field += `<line x1="${x}" y1="${y}" x2="${
          x + lineLength * Math.cos(angle)
        }" y2="${y + lineLength * Math.sin(angle)}" stroke="${generateColor(
          hash + x * y
        )}" stroke-width="1"/>`
      }
    }
    return field
  }

  const hash = hashString(title)
  const width = 150
  const height = 100

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      ${generateVectorField(hash, width, height)}
      <text x="50%" y="90%" font-family="Arial" font-size="12" fill="#fff" dy=".3em" text-anchor="middle">${encodeURIComponent(
        title
      )}</text>
    </svg>
  `

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
import React, {
  ReactElement,
  useState
  // useEffect
} from 'react'
import Markdown from '@shared/Markdown'
import MetaFull from './MetaFull'
import MetaSecondary from './MetaSecondary'
import AssetActions from '../AssetActions'
import { useUserPreferences } from '@context/UserPreferences'
// import Bookmark from './Bookmark'
import { useAsset } from '@context/Asset'
import Alert from '@shared/atoms/Alert'
import DebugOutput from '@shared/DebugOutput'
// import MetaMain from './MetaMain'
import EditHistory from './EditHistory'
import styles from './index.module.css'
import NetworkName from '@shared/NetworkName'
import content from '../../../../content/purgatory.json'
// import Web3 from 'web3'
import Button from '@shared/atoms/Button'
import Time from '@shared/atoms/Time'
import MetaItem from './MetaItem'

export default function AssetContent({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const { isInPurgatory, purgatoryData, isOwner, isAssetNetwork } = useAsset()
  const { debug } = useUserPreferences()
  const [receipts, setReceipts] = useState([])
  // const [nftPublisher, setNftPublisher] = useState<string>()

  // useEffect(() => {
  //   setNftPublisher(
  //     Web3.utils.toChecksumAddress(
  //       receipts?.find((e) => e.type === 'METADATA_CREATED')?.nft?.owner
  //     )
  //   )
  // }, [receipts])

  return (
    <>
      <div className={styles.datasetSection}>
        <div className={styles.featuredImage}>
          <div
            className={styles.assetimage}
            style={{
              backgroundImage: `url(${
                asset.metadata.additionalInformation.coverPicture
                  ? asset.metadata.additionalInformation.coverPicture
                  : generatePlaceholderUrl(asset.metadata.name)
              })`
            }}
          />
        </div>
        <div className={styles.songMainData}>
          <h1 className={styles.songName}>{asset.metadata.name}</h1>
          <div className={styles.artists}>
            {asset.metadata.additionalInformation.artist}
          </div>
          <div className={styles.songStats}>
            <span>
              Published <Time date={asset?.metadata.created} relative /> <br />
              {asset?.metadata.created !== asset?.metadata.updated && (
                <>
                  {' — '}
                  <span className={styles.updated}>
                    updated <Time date={asset?.metadata.updated} relative />
                  </span>
                </>
              )}
            </span>
            {asset?.stats?.orders > 0 && (
              <span>
                Purchased by {asset.stats.orders} user
                {asset.stats.orders > 1 && 's'}
              </span>
            )}
          </div>
          <div className={styles.songPriceBuy}>
            <AssetActions asset={asset} onAssetPage />
            <NetworkName
              networkId={asset?.chainId}
              className={styles.network}
            />
            {isOwner && isAssetNetwork && (
              <div className={styles.ownerActions}>
                <Button
                  style="text"
                  size="small"
                  to={`/asset/${asset?.id}/edit`}
                >
                  Edit Asset
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.datasetSection}>
        <div className={styles.metaWrap}>
          <div className={styles.metaFirstSection}>
            <div className={styles.songDescription}>
              <MetaItem
                title="Abstract"
                content={
                  isInPurgatory === true ? (
                    <Alert
                      title={content.asset.title}
                      badge={`Reason: ${purgatoryData?.reason}`}
                      text={content.asset.description}
                      state="error"
                    />
                  ) : (
                    <>
                      <Markdown
                        className={styles.description}
                        text={asset?.metadata?.description || ''}
                      />
                      <MetaSecondary ddo={asset} />
                    </>
                  )
                }
              />
            </div>
            <div className={styles.metaDataList}>
              <MetaFull ddo={asset} />
            </div>
          </div>
          <MetaItem title="DID" content={<code>{asset?.id}</code>} />
          <EditHistory receipts={receipts} setReceipts={setReceipts} />
          {debug === true && <DebugOutput title="DDO" output={asset} />}
        </div>
      </div>

      {/* <article className={styles.grid}>
        <div>
          <div className={styles.content}>
            <MetaMain asset={asset} nftPublisher={nftPublisher} />
            {asset?.accessDetails?.datatoken !== null && (
              <Bookmark did={asset?.id} />
            )}
          </div>
        </div>
      </article> */}
    </>
  )
}
