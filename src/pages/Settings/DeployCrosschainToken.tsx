import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { BigNumber } from 'bignumber.js'
import { EVM_ADDRESS_REGEXP, ZERO_ADDRESS } from '../../constants'
import { ERC20_ABI } from '../../constants/abis/erc20'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useRouterConfigContract } from '../../hooks/useContract'
import { useAppState } from '../../state/application/hooks'
import { getWeb3Library } from '../../utils/getLibrary'
import { deployInfinityERC20, deployCrosschainERC20 } from '../../utils/contract'

const OptionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  margin: 0.5rem 0;
  font-size: 1.2rem;
`

const OptionLabel = styled.label`
  display: flex;
  flex-direction: column;
`

const Input = styled.input`
  padding: 0.4rem 0;
  margin: 0.2rem 0;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.text3};
  outline: none;
  font-size: inherit;
  background-color: transparent;
  color: inherit;
`

const Button = styled.button`
  cursor: pointer;
  width: 100%;
  font-size: inherit;
  border: none;
  border-radius: 0.5rem;
  padding: 0.3rem;
`

export default function DeployCrosschainToken({ routerAddress }: { routerAddress: string }) {
  const { library, account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const addTransaction = useTransactionAdder()
  const { routerConfigChainId, routerConfigAddress } = useAppState()
  const routerConfig = useRouterConfigContract(routerConfigAddress, routerConfigChainId || 0, true)

  const [deployNewErc20] = useState(process.env.NODE_ENV === 'development' && false)
  const [pending, setPending] = useState(false)

  const [underlying, setUnderlying] = useState('')
  const [underlyingName, setUnderlyingName] = useState('')
  const [, setUnderlyingSymbol] = useState('')

  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [decimals, setDecimals] = useState(-1)

  const [vault] = useState(account)
  const [minter, setMinter] = useState('')

  useEffect(() => setMinter(routerAddress), [routerAddress])

  const [crosschainTokenChainId, setCrosschainTokenChainId] = useState<number | undefined>(undefined)
  const [crosschainTokenAddress, setCrosschainTokenAddress] = useState<string | undefined>(undefined)
  const [canDeployCrosschainToken, setCanDeployCrosschainToken] = useState(false)

  useEffect(() => {
    setCanDeployCrosschainToken(
      Boolean(underlying && name && symbol && decimals > -1 && vault && minter) && !crosschainTokenAddress
    )
  }, [underlying, name, symbol, decimals, vault, minter])

  useEffect(() => {
    const fetchUnderlyingInfo = async () => {
      if (!library || !underlying) return

      setPending(true)

      try {
        const web3 = getWeb3Library(library.provider)
        const code = await web3.eth.getCode(underlying)

        if (code === '0x') return setPending(false)

        //@ts-ignore
        const contract = new web3.eth.Contract(ERC20_ABI, underlying)
        const name = await contract.methods.name().call()
        const symbol = await contract.methods.symbol().call()
        const decimals = await contract.methods.decimals().call()

        setUnderlyingName(name)
        setUnderlyingSymbol(symbol)
        setName(`Crosschain${name}`)
        setSymbol(`CC${symbol}`)
        setDecimals(decimals)

        if (routerConfig) {
          const tokenConfig = await routerConfig.getTokenConfig(name, chainId)

          if (tokenConfig.ContractAddress && tokenConfig.ContractAddress !== ZERO_ADDRESS) {
            setCrosschainTokenChainId(chainId)
            setCrosschainTokenAddress(tokenConfig.ContractAddress)
          }
        }
      } catch (error) {
        console.error(error)
      }

      setPending(false)
    }

    if (chainId && underlying.match(EVM_ADDRESS_REGEXP)) {
      fetchUnderlyingInfo()
    }
  }, [underlying, chainId])

  const setTokenConfig = async () => {
    if (!routerConfig || !underlyingName) return

    const VERSION = 6

    setPending(true)

    try {
      await routerConfig.setTokenConfig(underlyingName, crosschainTokenChainId, {
        Decimals: decimals,
        ContractAddress: crosschainTokenAddress,
        ContractVersion: VERSION
      })
    } catch (error) {
      console.error(error)
    }

    setPending(false)
  }

  /* 
    template data:

    "MinimumSwap": 100 , 
    "MaximumSwap": 1000000,  
    "MinimumSwapFee":  1.5 
    "MaximumSwapFee": 10,
    "BigValueThreshold": 100000, 
    "SwapFeeRatePerMillion": 0.001 ,
    */
  const [minimumSwap, setMinimumSwap] = useState<string | undefined>('100') // (undefined)
  const [maximumSwap, setMaximumSwap] = useState<string | undefined>('1000000') // (undefined)
  const [minimumSwapFee, setMinimumSwapFee] = useState<string | undefined>('1.5') // (undefined)
  const [maximumSwapFee, setMaximumSwapFee] = useState<string | undefined>('10') // (undefined)
  const [bigValueThreshold, setBigValueThreshold] = useState<string | undefined>('100000') // (undefined)
  const [swapFeeRatePerMillion, setSwapFeeRatePerMillion] = useState<string | undefined>('0.001') // (undefined)

  const [canSetSwapConfig, setCanSetSwapConfig] = useState(false)

  useEffect(() => {
    setCanSetSwapConfig(
      Boolean(
        routerConfig &&
          underlyingName &&
          underlyingName &&
          minimumSwap &&
          maximumSwap &&
          minimumSwapFee &&
          maximumSwapFee &&
          bigValueThreshold
      )
    )
  }, [routerConfig, underlyingName, minimumSwap, maximumSwap, minimumSwapFee, maximumSwapFee, bigValueThreshold])

  const toUnitValue = (n: number | string | undefined) => {
    if (!n) return n
    // prevent from  exponential notation: ex. 1e+24
    BigNumber.config({ EXPONENTIAL_AT: 1e9 })

    const WEI_DECIMALS = 18

    return new BigNumber(n).times(10 ** WEI_DECIMALS).toString()
  }

  const setSwapConfig = async () => {
    if (!routerConfig || !canSetSwapConfig) return

    setPending(true)

    try {
      await routerConfig.setSwapConfig(underlyingName, chainId, {
        MinimumSwap: toUnitValue(minimumSwap),
        MaximumSwap: toUnitValue(maximumSwap),
        MinimumSwapFee: toUnitValue(minimumSwapFee),
        MaximumSwapFee: toUnitValue(maximumSwapFee),
        BigValueThreshold: toUnitValue(bigValueThreshold),
        SwapFeeRatePerMillion: new BigNumber(swapFeeRatePerMillion || 0).times(1_000_000).toString()
      })
    } catch (error) {
      console.error(error)
    }

    setPending(false)
  }

  const onTokenDeployment = async () => {
    if (!chainId || !account || !vault) return

    setPending(true)

    try {
      await deployCrosschainERC20({
        chainId,
        library,
        account,
        name,
        symbol,
        decimals,
        underlying,
        vault,
        minter,
        onHash: (hash: string) => {
          console.log('hash: ', hash)
        },
        onDeployment: ({
          address,
          chainId,
          hash,
          name
        }: {
          address: string
          chainId: number
          hash: string
          name: string
        }) => {
          setCrosschainTokenAddress(address)
          setCrosschainTokenChainId(chainId)
          addTransaction(
            { hash },
            {
              summary: `Deployment: chain ${chainId}; crosschain token ${name} ${address}`
            }
          )
        }
      })
    } catch (error) {
      console.error(error)
    }

    setPending(false)
  }

  const [testERC20Name, setTestERC20Name] = useState('')
  const [testERC20Symbol, setTestERC20Symbol] = useState('')

  const onInfinityERC20Deployment = async () => {
    setPending(true)

    try {
      await deployInfinityERC20({
        library,
        account,
        onHash: (hash: string) => console.log('deploy new ERC20: ', hash),
        name: testERC20Name,
        symbol: testERC20Symbol,
        decimals: 18
      })
    } catch (error) {
      console.error(error)
    }

    setPending(false)
  }

  return (
    <>
      {deployNewErc20 && (
        <OptionWrapper>
          {t('newERC20')} ({t('optional')})
          <Input
            defaultValue={testERC20Name}
            type="text"
            placeholder="Name"
            onChange={event => setTestERC20Name(event.target.value)}
          />
          <Input
            defaultValue={testERC20Symbol}
            type="text"
            placeholder="Symbol"
            onChange={event => setTestERC20Symbol(event.target.value)}
          />
          <Button disabled={!(testERC20Name && testERC20Symbol) || pending} onClick={onInfinityERC20Deployment}>
            {t('deployInfinityERC20')}
          </Button>
        </OptionWrapper>
      )}
      <OptionWrapper>
        <OptionLabel>
          {t('addressOfERC20Token')}
          <Input
            disabled={pending}
            defaultValue={underlying}
            type="text"
            placeholder="0x..."
            onChange={event => setUnderlying(event.target.value)}
          />
        </OptionLabel>
      </OptionWrapper>
      <Button disabled={!canDeployCrosschainToken || pending} onClick={onTokenDeployment}>
        {t('deployCrossChainToken')}
      </Button>

      <OptionWrapper>
        <OptionLabel>
          {/* {t('')} */}
          ID of the crosschain token network
          <Input
            disabled={pending}
            defaultValue={crosschainTokenChainId}
            type="number"
            onChange={event => setCrosschainTokenChainId(Number(event.target.value))}
          />
        </OptionLabel>
      </OptionWrapper>
      <OptionWrapper>
        <OptionLabel>
          {/* {t('')} */}
          Crosschain token address
          <Input
            disabled={pending}
            defaultValue={crosschainTokenAddress}
            type="text"
            placeholder="0x123..."
            onChange={event => setCrosschainTokenAddress(event.target.value)}
          />
        </OptionLabel>
      </OptionWrapper>
      <Button disabled={!underlyingName || !chainId || !decimals || pending} onClick={setTokenConfig}>
        {t('setTokenConfig')}
      </Button>

      <OptionWrapper>
        <OptionWrapper>
          <OptionLabel>
            {/* {t('')} */}
            Minimum swap amount
            <Input defaultValue={minimumSwap} type="number" onChange={event => setMinimumSwap(event.target.value)} />
          </OptionLabel>
        </OptionWrapper>

        <OptionWrapper>
          <OptionLabel>
            {/* {t('')} */}
            Maximum swap amount
            <Input defaultValue={maximumSwap} type="number" onChange={event => setMaximumSwap(event.target.value)} />
          </OptionLabel>
        </OptionWrapper>

        <OptionWrapper>
          <OptionLabel>
            {/* {t('')} */}
            Minimum swap fee
            <Input
              defaultValue={minimumSwapFee}
              type="number"
              onChange={event => setMinimumSwapFee(event.target.value)}
            />
          </OptionLabel>
        </OptionWrapper>

        <OptionWrapper>
          <OptionLabel>
            {/* {t('')} */}
            Maximum swap fee
            <Input
              defaultValue={maximumSwapFee}
              type="number"
              onChange={event => setMaximumSwapFee(event.target.value)}
            />
          </OptionLabel>
        </OptionWrapper>

        <OptionWrapper>
          <OptionLabel>
            {/* {t('')} */}
            Big value threshold (what is this and how does it affect the swap?)
            <Input
              defaultValue={bigValueThreshold}
              type="number"
              onChange={event => setBigValueThreshold(event.target.value)}
            />
          </OptionLabel>
        </OptionWrapper>

        <OptionWrapper>
          <OptionLabel>
            {/* {t('')} */}
            Swap fee rate per million (what is this?)
            <Input
              defaultValue={swapFeeRatePerMillion}
              type="number"
              onChange={event => setSwapFeeRatePerMillion(event.target.value)}
            />
          </OptionLabel>
        </OptionWrapper>

        <Button disabled={pending || !canSetSwapConfig} onClick={setSwapConfig}>
          {t('setSwapConfig')}
        </Button>
      </OptionWrapper>
    </>
  )
}
