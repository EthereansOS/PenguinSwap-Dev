import React, { useEffect, useState } from "react";

import AppBody from "pages/AppBody";
import { Wrapper } from "components/swap/styleds";
import { Button } from "theme/components";
import { getPenguinCollectionAddress, getPenguinCollectionWrapLink, loadItemCollections } from "utils/itemIntegration";

import CreateItemWizard from './createItemWizard/view'
import { useActiveWeb3React } from 'hooks'

export default function Item() {

  const [createItem, setCreateItem] = useState(false);

  const { library, chainId } = useActiveWeb3React();

  useEffect(function() {
    loadItemCollections(library, chainId);
  }, []);

  return (
    <AppBody>
      <Wrapper id="item-page">
        {!createItem && <>
          <Button onClick={() => window.open(getPenguinCollectionWrapLink(), '_blank')}>
            Wrap An Item
          </Button>
          <Button onClick={() => setCreateItem(true)}>
            Create a new Item
          </Button>
        </>}
        {createItem && <>
          <h3>Create Item</h3>
          <CreateItemWizard collectionAddress={getPenguinCollectionAddress(chainId)} onCancel={() => setCreateItem(false)}/>
        </>}
      </Wrapper>
    </AppBody>
  )
}
