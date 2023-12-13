### `Changing the asset type`

The marketplace currently lists audio files. That is specified by a variable `category`, in the `additionalInformation` field of the metadata. If you would like to change the type of assets offered in your fork (say, to mp4 videos), instances of the term `audio` need to be changed to your own type of asset in three locations:

- In the file `aquarius.ts`, line 53:

```tsx
getFilterTerm('metadata.additionalInformation.category', 'audio')
```

- In the file `aquarius.ts`, line 53:

```tsx
getFilterTerm('metadata.additionalInformation.category', 'audio')
```

Here's what it does:

- It accesses essential Web3-related context variables such as `accountId`, `web3`, and `chainId` using the `useWeb3` hook.
