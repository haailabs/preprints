import React, { ReactElement, useState } from 'react'
import { useField, useFormikContext } from 'formik'
import FileInfo from './Info'
import UrlInput from '../URLInput'
import { InputProps } from '@shared/FormInput'
import { getFileUrlInfo } from '@utils/provider'
import { FormPublishData } from 'src/components/Publish/_types'
import { LoggerInstance } from '@oceanprotocol/lib'
import { useAsset } from '@context/Asset'

const ACCEPTED_FILE_TYPES = ['application/pdf']

export default function FilesInput(props: InputProps): ReactElement {
  const [field, meta, helpers] = useField(props.name)
  const [isLoading, setIsLoading] = useState(false)
  const { values, setFieldError } = useFormikContext<FormPublishData>()
  const { asset } = useAsset()

  async function handleValidation(e: React.SyntheticEvent, url: string) {
    // File example 'https://oceanprotocol.com/tech-whitepaper.pdf'
    e.preventDefault()

    try {
      const providerUrl = values?.services
        ? values?.services[0].providerUrl.url
        : asset.services[0].serviceEndpoint
      setIsLoading(true)
      const checkedFile = await getFileUrlInfo(url, providerUrl)

      // error if something's not right from response
      if (!checkedFile)
        throw Error('Could not fetch file info. Is your network down?')

      if (checkedFile[0].valid === false)
        throw Error('✗ No valid file detected. Check your URL and try again.')

      // accept only mp3 and flac files
      if (!ACCEPTED_FILE_TYPES.includes(checkedFile[0].contentType)) {
        const type = await fetch(url)
          .then((response) => response.blob())
          .then((blob) => {
            return blob.type
          })

        console.log('type', type)

        if (!ACCEPTED_FILE_TYPES.includes(type)) {
          throw Error('✗ No audio file detected. Check your URL and try again.')
        }
      }

      // if all good, add file to formik state
      helpers.setValue([{ url, ...checkedFile[0] }])
    } catch (error) {
      setFieldError(`${field.name}[0].url`, error.message)
      LoggerInstance.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  function handleClose() {
    helpers.setValue(meta.initialValue)
    helpers.setTouched(false)
  }

  return (
    <>
      {field?.value?.[0]?.valid === true ? (
        <FileInfo file={field.value[0]} handleClose={handleClose} />
      ) : (
        <UrlInput
          submitText="Validate"
          {...props}
          name={`${field.name}[0].url`}
          isLoading={isLoading}
          handleButtonClick={handleValidation}
        />
      )}
    </>
  )
}
