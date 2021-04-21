import React, { Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import Settings from '../Settings'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { ButtonRadio } from '../Button'
import { TokenType } from 'utils/itemIntegration'

const StyledSwapHeader = styled.div`
  padding: 12px 1rem 0px 1.5rem;
  margin-bottom: -4px;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.text2};
`

interface SwapHeader {
  tokenType? : TokenType
  onTokenTypeChange? : Dispatch<SetStateAction<TokenType>>
}

export default function SwapHeader({
  tokenType,
  onTokenTypeChange
} : SwapHeader) {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <TYPE.black fontWeight={500}>Swap</TYPE.black>
        {onTokenTypeChange && <ButtonRadio active={tokenType === TokenType.ERC20} onClick={() => onTokenTypeChange(TokenType.ERC20)}>ERC-20</ButtonRadio>}
        {onTokenTypeChange && <ButtonRadio active={tokenType === TokenType.Item} onClick={() => onTokenTypeChange(TokenType.Item)}>Item</ButtonRadio>}
        <Settings />
      </RowBetween>
    </StyledSwapHeader>
  )
}
