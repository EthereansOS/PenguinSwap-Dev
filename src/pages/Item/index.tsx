import React, { useEffect } from "react";

import AppBody from "pages/AppBody";
import { Wrapper } from "components/swap/styleds";
import { Button } from "theme/components";
import { getPenguinCollectionWrapLink, loadItemCollections, getPenguinCollectionCreateLink } from "utils/itemIntegration";

import { useActiveWeb3React } from 'hooks'

export default function Item() {


  const { library, chainId } = useActiveWeb3React();

  useEffect(function() {
    loadItemCollections(library, chainId);
  }, []);

  return (
    <AppBody>
      <Wrapper id="item-page">
        <>
          <Button onClick={() => window.open(getPenguinCollectionWrapLink(), '_blank')}>
            Wrap An Item
          </Button>
          <Button onClick={() => window.open(getPenguinCollectionCreateLink(chainId), '_blank')}>
            Create a new Item
          </Button>
        </>
      </Wrapper>
    </AppBody>
  )
}
