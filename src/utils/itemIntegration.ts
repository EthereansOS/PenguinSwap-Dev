import { ethers } from 'ethers';
import { getContract } from 'utils';
import { TokenList } from '@uniswap/token-lists'

const abi = new ethers.utils.AbiCoder();
const window: any = global;

window.voidEthereumAddress = window.voidEthereumAddress || '0x0000000000000000000000000000000000000000';
window.voidEthereumAddressExtended = window.voidEthereumAddressExtended || '0x0000000000000000000000000000000000000000000000000000000000000000';
window.descriptionWordLimit = window.descriptionWordLimit || 300;
window.oldUrlRegex = window.oldUrlRegex || new RegExp("(https?:\\/\\/[^\s]+)", "gs");
window.urlRegex = window.urlRegex || new RegExp("(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$", "gs");
window.IPFSRegex = window.IPFSRegex || new RegExp("(.+)(\/ipfs\/)[a-zA-Z0-9]+$", "gs");
window.solidityImportRule = window.solidityImportRule || new RegExp("import( )+\"(\\d+)\"( )*;", "gs");
window.pragmaSolidityRule = window.pragmaSolidityRule || new RegExp("pragma( )+solidity( )*(\\^|>)\\d+.\\d+.\\d+;", "gs");
window.base64Regex = window.base64Regex || new RegExp("data:([\\S]+)\\/([\\S]+);base64", "gs");

window.contextURL = window.contextURL || "https://raw.githubusercontent.com/EthereansOS/ITEMS-Interface/main/data/context.json";
window.trustwalletImgURLTemplate = window.trustwalletImgURLTemplate || "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/{0}/logo.png"

window.metadatas = window.metadatas || {};
window.ethItemElementImages = window.ethItemElementImages || {};

window.web3ForLogs = window.web3ForLogs || (window.web3 = {
    startBlock: 0,
    utils: {
        toChecksumAddress(address: any | string): any {
            return ethers.utils.getAddress(address).toString();
        },
        sha3(value: any): any {
            return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(value))
        }
    },
    eth: {
        getCode(address: any): Promise<any> {
            return window.web3.currentProvider.getCode(address);
        },
        getBlockNumber(): Promise<any> {
            return window.web3.currentProvider.getBlockNumber();
        },
        call(args: any): Promise<any> {
            return window.web3.currentProvider.call(args);
        },
        async getPastLogs(args: any) {
            try {
                args.fromBlock = parseInt(args.fromBlock);
            } catch (e) {
            }
            try {
                args.toBlock = parseInt(args.toBlock);
            } catch (e) {
            }
            if (args.address && args.address instanceof Array) {
                var logs: any = [];
                var addresses: any = args.address;
                var data = await Promise.all(addresses.map((it: any) => {
                    var logargs = JSON.parse(JSON.stringify(args));
                    logargs.address = it;
                    return window.web3.currentProvider.getLogs(logargs);
                }));
                data.forEach((it: any) => logs.push(...it));
                return logs;
            }
            return await window.web3.currentProvider.getLogs(args);
        },
        abi: {
            decodeParameter(type: any, value: any) {
                return abi.decode([type], value)[0];
            },
            decodeParameters(type: any[], value: any) {
                return abi.decode(type, value);
            },
            encodeParameter(type: any, value: any) {
                return abi.encode([type], [value]);
            },
            encodeParameters(type: any[], value: any[]) {
                return abi.encode(type, value);
            }
        }
    }
});

window.blockchainCall = window.blockchainCall || function blockchainCall() {
    var method = arguments[0];
    var args: any[] = [];
    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    return method.apply(method, args);
};

window.newContract = window.newContract || function newContract(abi: any, address: any) {
    window.contracts = window.contracts || {};
    var key = window.web3.utils.sha3(JSON.stringify(abi));
    var contracts = (window.contracts[key] = window.contracts[key] || {});
    address = address || window.voidEthereumAddress;
    key = address.toLowerCase();
    contracts[key] = contracts[key] || getContract(address === window.voidEthereumAddress ? undefined : address, abi, window.web3.currentProvider);
    contracts[key].options = contracts[key].options || { address: contracts[key].address };
    contracts[key].methods = contracts[key].methods || contracts[key];
    return contracts[key];
};

window.getLogs = window.getLogs || async function (a: any, endOnFirstResult: any) {
    var args = JSON.parse(JSON.stringify(a));
    var logs = [];
    args.fromBlock = args.fromBlock || window.numberToString(window.getNetworkElement('deploySearchStart') || 0);
    args.toBlock = args.toBlock || window.numberToString(await window.web3.eth.getBlockNumber());
    var fillWithWeb3Logs = async function (logs: any, args: any) {
        if (window.web3.currentProvider === window.web3ForLogs.currentProvider) {
            return logs;
        }
        var newArgs: any = {};
        Object.entries(args).forEach(entry => newArgs[entry[0]] = entry[1]);
        newArgs.fromBlock = window.web3.startBlock;
        newArgs.toBlock = 'latest';
        logs.push(...(await window.web3.eth.getPastLogs(newArgs)));
        return logs;
    };
    while (true) {
        logs.push(...(await window.web3ForLogs.eth.getPastLogs(args)));
        args.toBlock = window.numberToString(parseInt(args.fromBlock) - 1);
        args.fromBlock = window.numberToString(parseInt(args.toBlock) - (window.context.blockSearchSection || 0));
        if (parseInt(args.fromBlock) >= parseInt(args.toBlock)) {
            if (logs.length > 0 && endOnFirstResult === true) {
                return await fillWithWeb3Logs(logs, args);
            }
            break;
        }
    }
    return await fillWithWeb3Logs(logs, args);
};

window.getNetworkElement = window.getNetworkElement || function getNetworkElement(element: any) {
    var network = window.context.ethereumNetwork[window.networkId];
    if (network === undefined || network === null) {
        return;
    }
    return window.context[element + network];
};

window.normalizeName = window.normalizeName || function normalizeName(name: any) {
    return name.split('-').join(' ').split('_').join(' ').firstLetterToUpperCase();
};

window.loadCollectionENS = window.loadCollectionENS || async function loadCollectionENS(collection: any) {
    if (collection.ens !== undefined && collection.ens !== null) {
        return;
    }
    collection.ens = "";
    try {
        var address = await window.blockchainCall(window.ethItemOrchestrator.methods.ENSController);
        var ensEvent = "ENSAttached(address,string,string)";
        var topics = [
            window.web3.utils.sha3(ensEvent),
            window.web3.eth.abi.encodeParameter("address", collection.address)
        ];
        var logs = await window.getLogs({
            address,
            topics
        }, true);
        for (var log of logs) {
            var subdomain = window.web3.eth.abi.decodeParameter("string", log.data);
            collection.ens = `${subdomain}.${window.context.ensDomainName}`;
        }
    } catch (e) { }
};

window.numberToString = window.numberToString || function numberToString(num: any, locale: any) {
    if (num === undefined || num === null) {
        num = 0;
    }
    if ((typeof num).toLowerCase() === 'string') {
        return num;
    }
    let numStr = String(num);

    if (Math.abs(num) < 1.0) {
        let e = parseInt(num.toString().split('e-')[1]);
        if (e) {
            let negative = num < 0;
            if (negative) num *= -1
            num *= Math.pow(10, e - 1);
            numStr = '0.' + (new Array(e)).join('0') + num.toString().substring(2);
            if (negative) numStr = "-" + numStr;
        }
    } else {
        let e = parseInt(num.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            num /= Math.pow(10, e);
            numStr = num.toString() + (new Array(e + 1)).join('0');
        }
    }
    if (locale === true) {
        var numStringSplitted = numStr.split(' ').join('').split('.');
        return parseInt(numStringSplitted[0]).toLocaleString() + (numStringSplitted.length === 1 ? '' : ("." + numStringSplitted[1]))
    }
    return numStr;
};

window.loadBlockSearchTranches = window.loadBlockSearchTranches || async function loadBlockSearchTranches() {
    var startBlock = parseInt(window.numberToString(window.getNetworkElement("deploySearchStart") || "0"));
    var endBlock = parseInt(window.numberToString(await window.web3.eth.getBlockNumber()));
    var limit = window.context.blockSearchLimit;
    var toBlock = endBlock;
    var fromBlock = endBlock - limit;
    fromBlock = fromBlock < startBlock ? startBlock : fromBlock;
    var blocks = [];
    while (true) {
        blocks.push([window.numberToString(fromBlock), window.numberToString(toBlock)]);
        if (fromBlock === startBlock) {
            break;
        }
        toBlock = fromBlock - 1;
        fromBlock = toBlock - limit;
        fromBlock = fromBlock < startBlock ? startBlock : fromBlock;
    }
    return blocks;
};

window.formatLink = window.formatLink || function formatLink(link: any) {
    link = (link ? link instanceof Array ? link[0] : link : '');
    if (link.indexOf('assets') === 0 || link.indexOf('/assets') === 0) {
        return link;
    }
    for (var temp of window.context.ipfsUrlTemplates) {
        link = link.split(temp).join(window.context.ipfsUrlChanger);
    }
    while (link && link.startsWith('/')) {
        link = link.substring(1);
    }
    if (link.endsWith('.eth')) {
        link += ".link";
    }
    return (!link ? '' : link.indexOf('http') === -1 ? ('https://' + link) : link).split('https:').join('').split('http:').join('');
};

window.AJAXRequest = function AJAXRequest(link: any, timeout: any, toU: any) {
    var toUpload = toU !== undefined && toU !== null && typeof toU !== 'string' ? JSON.stringify(toU) : toU;
    var xmlhttp = window.XMLHttpRequest ? new window.XMLHttpRequest() : new window.ActiveXObject('Microsoft.XMLHTTP');
    return new Promise(function (ok, ko) {
        var going = true;
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                if (going) {
                    going = false;
                    var response = xmlhttp.responseText;
                    try {
                        response = JSON.parse(response);
                    } catch (e) { }
                    ok(response);
                }
                try {
                    xmlhttp.abort();
                } catch (e) {
                    console.error(e);
                }
            }
        }
        xmlhttp.onloadend = function onloadend() {
            if (!xmlhttp.status || xmlhttp.status >= 300) {
                return ko(xmlhttp.status);
            }
        };
        xmlhttp.open(toUpload ? 'POST' : 'GET', link + (link.indexOf('?') === -1 ? '?' : '&') + ('cached_' + new Date().getTime()) + '=' + (new Date().getTime()), true);
        try {
            toUpload ? xmlhttp.send(toUpload) : xmlhttp.send();
        } catch (e) {
            return ko(e);
        }
        (timeout !== undefined && timeout !== null) && setTimeout(function () {
            if (!going) {
                return;
            }
            going = false;
            try {
                xmlhttp.abort();
            } catch (e) {
                console.error(e);
            }
            ko();
        }, timeout);
    });
};

window.loadCollectionsWork = window.loadCollectionsWork || async function loadCollectionsWork() {
    var map: any = {};
    Object.entries(window.context.ethItemFactoryEvents).forEach(it => map[window.web3.utils.sha3(it[0])] = it[1]);
    var topics: any[] = [[Object.keys(map).filter(key => map[key].indexOf("721") === -1)]];
    topics.push([Object.keys(map).filter(key => map[key].indexOf("721") !== -1), [], window.web3.eth.abi.encodeParameter("uint256", "2")])
    var address = await window.blockchainCall(window.ethItemOrchestrator.methods.factories);
    (window.getNetworkElement("additionalFactories") || []).map((it: any) => window.web3.utils.toChecksumAddress(it)).filter((it: any) => address.indexOf(it) === -1).forEach((it: any) => address.push(it));
    var collections: any[] = [];
    var blocks = await window.loadBlockSearchTranches();
    var updateSubCollectionsPromise = function updateSubCollectionsPromise(subCollections: any[]) {
        return new Promise(function (ok, ko) {
            collections.push(...subCollections);
            Promise.all(subCollections.map(window.refreshSingleCollection)).then(ok).catch(ko)
        });
    }
    var subCollectionsPromises = [];
    for (var block of blocks) {
        var subCollections = [];
        var logs = [];
        for (var topic of topics) {
            logs.push(...(await window.getLogs({
                address,
                topics: topic,
                fromBlock: block[0],
                toBlock: block[1]
            })));
        }
        for (var log of logs) {
            var modelAddress = window.web3.eth.abi.decodeParameter("address", log.topics[1]);
            var collectionAddress = window.web3.utils.toChecksumAddress(window.web3.eth.abi.decodeParameter("address", log.topics[log.topics.length - 1]));
            if (window.context.excludingCollections.indexOf(collectionAddress) !== -1) {
                continue;
            }
            var category = map[log.topics[0]];
            subCollections.push(window.packCollection(collectionAddress, category, modelAddress));
        }
        subCollectionsPromises.push(updateSubCollectionsPromise(subCollections));
    }
    await Promise.all(subCollectionsPromises);
    return collections;
};

window.packCollection = window.packCollection || function packCollection(address: any, category: any, modelAddress: any) {
    window.globalCollections = window.globalCollections || [];
    var abi = window.context[category];
    var contract = window.newContract(abi, address);
    category = category.substring(0, category.length - 3);
    var key = address;
    var collection = window.globalCollections.filter((it: any) => it.key === key)[0];
    !collection && window.globalCollections.push(collection = {
        key,
        address,
        modelAddress,
        category,
        contract
    });
    return collection;
};

window.refreshSingleCollection = window.refreshSingleCollection || async function refreshSingleCollection(collection: any) {
    if (window.context.excludingCollections.indexOf(collection.address) !== -1) {
        return null;
    }
    collection.name = collection.name || await window.blockchainCall(collection.contract.methods["name()"]);
    collection.symbol = collection.symbol || await window.blockchainCall(collection.contract.methods["symbol()"]);
    if (!collection.sourceAddress) {
        collection.sourceAddress = "blank";
        try {
            collection.sourceAddress = await window.blockchainCall(collection.contract.methods.source);
        } catch (e) { }
    }
    try {
        collection.modelVersion = collection.modelVersion || await window.blockchainCall(collection.contract.methods.modelVersion);
    } catch (e) {
        collection.modelVersion = 1;
    }
    delete collection.isOwner;
    try {
        collection.isOwner = (collection.extensionAddress = window.web3.utils.toChecksumAddress(await window.blockchainCall(collection.contract.methods.extension))) === window.walletAddress;
    } catch (e) { }
    try {
        collection.extensionIsContract = (await window.web3.eth.getCode(collection.extensionAddress)) !== '0x';
    } catch (e) { }
    try {
        collection.standardVersion = collection.standardVersion || (await window.blockchainCall(collection.contract.methods.mainInterfaceVersion));
    } catch (e) {
        collection.standardVersion = 1;
    }
    try {
        collection.interoperableInterfaceModel = collection.interoperableInterfaceModel || (await window.blockchainCall(collection.contract.methods.interoperableInterfaceModel));
        collection.interoperableInterfaceModelAddress = collection.interoperableInterfaceModelAddress || collection.interoperableInterfaceModel[0];
        collection.interoperableInterfaceModelVersion = collection.interoperableInterfaceModelVersion || collection.interoperableInterfaceModel[1];
        collection.erc20WrappedItemVersion = collection.interoperableInterfaceModelVersion;
    } catch (e) {
        try {
            collection.interoperableInterfaceModel = (await window.blockchainCall((window.newContract(window.context.OldNativeABI, collection.address)).methods.erc20NFTWrapperModel));
            collection.interoperableInterfaceModelAddress = collection.interoperableInterfaceModelAddress || collection.interoperableInterfaceModel[0];
            collection.interoperableInterfaceModelVersion = collection.interoperableInterfaceModelVersion || collection.interoperableInterfaceModel[1];
        } catch (e) {
            collection.interoperableInterfaceModelAddress = collection.interoperableInterfaceModelAddress || collection.address;
            collection.interoperableInterfaceModelVersion = collection.interoperableInterfaceModelVersion || 1;
        }
        collection.erc20WrappedItemVersion = collection.interoperableInterfaceModelVersion;
    }
    delete collection.problems;
    await window.tryRetrieveMetadata(collection);

    collection.openSeaName = collection.name.toLowerCase().split(' ').join('-');
    delete collection.hasBalance;
    window.loadCollectionENS(collection);
    collection.loaded = true;
    return collection;
};

window.loadUri = window.loadUri || async function loadUri(contract: any) {
    var data = await window.web3.eth.call({
        to: contract.address,
        data: window.web3.utils.sha3("uri()").substring(0, 10)
    });
    return window.web3.eth.abi.decodeParameter("string", data);
};

window.tryRetrieveMetadata = window.tryRetrieveMetadata || async function tryRetrieveMetadata(item: any) {
    if (item.metadataLink) {
        return;
    }
    if (window.context.pandorasBox.indexOf(window.web3.utils.toChecksumAddress(item.address)) !== -1 ||
        (item.collection && window.context.pandorasBox.indexOf(window.web3.utils.toChecksumAddress(item.collection.address)) !== -1) ||
        (item.collection && item.collection.sourceAddress && item.collection.sourceAddress !== "blank" && window.context.pandorasBox.indexOf(window.web3.utils.toChecksumAddress(item.collection.sourceAddress)) !== -1)) {
        item.metadataLink = "blank";
        item.image = window.getElementImage(item);
        return;
    }
    var clearMetadata = true;
    try {
        item.metadataLink = item.objectId ? await window.blockchainCall(item.contract.methods["uri(uint256)"], item.objectId) : await window.loadUri(item.contract);
        item.objectId && (item.metadataLink = item.metadataLink.split('0x{id}').join(item.objectId));
        item.metadataLink = window.metadatas[item.address] || item.metadataLink;
        if (item.metadataLink !== "") {
            item.image = window.formatLink(item.metadataLink);
            try {
                item.metadata = await window.AJAXRequest(window.formatLink(item.metadataLink));
                if (typeof item.metadata !== "string") {
                    Object.entries(item.metadata).forEach(it => {
                        if (it[1] === undefined || it[1] === null) {
                            delete item.metadata[it[0]];
                            return;
                        }
                        item[it[0]] = it[1]
                    });
                    item.name = item.item_name || item.name;
                    item.description = item.description && item.description.split('\n\n').join(' ');
                }
            } catch (e) {
                delete item.image;
                item.image = window.getElementImage(item);
                item.metadataMessage = `Could not retrieve metadata, maybe due to CORS restriction policies for the link (<a href="${item.metadataLink}" target="_blank">${item.metadataLink}</a>), check it on <a href="${item.collection ? window.context.openSeaItemLinkTemplate.format(item.collection.address, item.objectId) : window.context.openSeaCollectionLinkTemplate.format(item.address)}" target="_blank">Opensea</a>`
                console.error(item.metadataMessage);
            }
            clearMetadata = false;
        }
    } catch (e) {
        console.error(e);
    }
    clearMetadata && delete item.metadata;
    clearMetadata && (item.metadataLink = clearMetadata ? "blank" : item.metadataLink);
    if (!clearMetadata && window.ethItemElementImages[item.address] && !item.elementImageLoaded) {
        item.elementImageLoaded = window.ethItemElementImages[item.address];
        item.logoURI = item.elementImageLoaded;
        item.logoUri = item.elementImageLoaded;
        item.image = item.elementImageLoaded;
    }
    if ((window.itemsTokens = window.itemsTokens || []).filter((it: any) => it.address === item.address).length === 0) {
        window.itemsTokens.push({
            address: item.address,
            logoURI: item.image
        });
    }
};

window.getElementImage = window.getElementImage || function getElementImage(element: any) {
    return window.formatLink(element.image || window.context.defaultItemData[element.category || element.collection.category][element.collection ? 'item' : 'collection'].image);
};

window.loadItemCollectionTokensWork = window.loadItemCollectionTokensWork || async function loadItemCollectionTokensWork(collection : any) {
    var objectIds = await window.loadCollectionItems(collection.address);
    await Promise.all(objectIds.map((item : any) => window.loadItemData(item, collection)));
    return collection.items ? Object.values(collection.items).map((item : any) => {
        return {
            name : item.name,
            symbol : item.symbol,
            decimals : parseInt(item.decimals || 1),
            logoURI : item.image,
            chainId : window.networkId,
            address : item.address,
            tags : []
        }
    }) : [];
};

window.loadCollectionItems = window.loadCollectionItems || async function loadCollectionItems(collectionAddressToSearch : any) {
    var collectionAddress = collectionAddressToSearch;
    if (!(collectionAddress instanceof Array)) {
        var collection = window.globalCollections.filter((it : any) => it.address === collectionAddress)[0];
        if (collection.category === 'W1155' && window.context.W1155GroupMode === true) {
            collectionAddress = window.globalCollections.filter((it: any) => it.category === 'W1155' && it.sourceAddress === collection.sourceAddress).map((it : any) => it.address);
        }
    }
    window.itemObjectIdLinker = window.itemObjectIdLinker || {};
    var logs = await window.getLogs({
        address: collectionAddress,
        topics: [window.web3.utils.sha3("NewItem(uint256,address)")]
    });
    logs = logs && logs.length > 0 ? logs : await window.getLogs({
        address: collectionAddress,
        topics: [window.web3.utils.sha3("Mint(uint256,address,uint256)")]
    });
    var collectionObjectIds : any = {};
    for (var log of logs) {
        var objectId;
        var address;
        try {
            objectId = window.web3.eth.abi.decodeParameter("uint256", log.topics[1]);
            address = window.web3.eth.abi.decodeParameter("address", log.topics[2]);
        } catch (e) {
            objectId = window.web3.eth.abi.decodeParameters(["uint256", "address", "uint256"], log.data)[0];
            address = window.web3.eth.abi.decodeParameters(["uint256", "address", "uint256"], log.data)[1];
        }
        collectionObjectIds[objectId] = window.itemObjectIdLinker[objectId] = window.itemObjectIdLinker[objectId] || {
            objectId,
            address,
            collectionAddress: log.address
        }
    }
    return Object.values(collectionObjectIds);
};

window.loadCorrectCollection = window.loadCorrectCollection || async function loadCorrectCollection(item : any, oldCollection : any) {
    window.itemObjectIdLinker = window.itemObjectIdLinker || {};
    if (oldCollection.category !== 'W1155' || window.context.W1155GroupMode !== true || item.correctCollectionLoaded || !window.itemObjectIdLinker[item.objectId]) {
        return;
    }
    item.correctCollectionLoaded = true;
    if (window.itemObjectIdLinker[item.objectId].collectionAddress === oldCollection.address) {
        return item.collection = oldCollection;
    }
    var correctCollection = window.globalCollections.filter((it : any) => it.address === window.itemObjectIdLinker[item.objectId].collectionAddress)[0];
    if (!correctCollection) {
        correctCollection = await window.loadSingleCollection(window.itemObjectIdLinker[item.objectId].collectionAddress);
    }
    correctCollection.items = correctCollection.items || {};
    Object.entries(oldCollection.items).forEach(it => correctCollection.items[it[0]] = it[1]);
    Object.entries(correctCollection.items).forEach(it => oldCollection.items[it[0]] = it[1]);
    item.collection = correctCollection;
}

window.loadItemData = window.loadItemData || async function loadItemData(item : any, collection : any) {
    item = item || {};
    item.dynamicData = item.dynamicData || {};
    collection.items = collection.items || {};
    item.objectId = item.objectId;
    collection.items[item.objectId] = item;
    item.key = item.objectId;
    await window.loadCorrectCollection(item, collection);
    item.collection = item.collection || collection;
    item.contract = item.collection.contract;
    try {
        item.address = item.address || window.web3.utils.toChecksumAddress(await window.blockchainCall(item.contract.methods.asInteroperable, item.objectId));
    } catch (e) {
        item.address = window.web3.utils.toChecksumAddress(await window.blockchainCall(window.newContract(window.context.OldNativeABI, item.contract.options.address).methods.asERC20, item.objectId));
    }
    item.token = item.token || window.newContract(window.context.IEthItemInteroperableInterfaceABI, item.address);
    item.name = item.name || await window.blockchainCall(item.contract.methods["name(uint256)"], item.objectId);
    item.symbol = item.symbol || await window.blockchainCall(item.contract.methods["symbol(uint256)"], item.objectId);
    if (!item.sourceAddress) {
        item.sourceAddress = "blank";
        try {
            item.sourceAddress = await window.blockchainCall(item.collection.contract.methods.source, item.objectId);
        } catch (e) {}
    }
    try {
        item.sourceName = item.sourceName || await window.blockchainCall(window.newContract(window.context.IERC1155ABI, item.collection.sourceAddress).methods.name, item.objectId);
    } catch (e) {}
    try {
        item.sourceSymbol = item.sourceSymbol || await window.blockchainCall(window.newContract(window.context.IERC1155ABI, item.collection.sourceAddress).methods.symbol, item.objectId);
    } catch (e) {}
    try {
        item.sourceName = item.sourceName || await window.blockchainCall(window.newContract(window.context.IERC20ABI, item.sourceAddress).methods.name);
    } catch (e) {}
    try {
        item.sourceSymbol = item.sourceSymbol || await window.blockchainCall(window.newContract(window.context.IERC20ABI, item.sourceAddress).methods.symbol);
    } catch (e) {}
    try {
        item.sourceName = item.sourceName || window.web3.utils.toChecksumAddress(item.sourceAddress && item.sourceAddress !== 'blank' ? item.sourceAddress : item.collection.sourceAddress);
    } catch (e) {
        item.sourceName = 'blank';
    }
    try {
        item.sourceSymbol = item.sourceSymbol || window.web3.utils.toChecksumAddress(item.sourceAddress && item.sourceAddress !== 'blank' ? item.sourceAddress : item.collection.sourceAddress);
    } catch (e) {
        item.sourceSymbol = 'blank';
    }
    await (item.metadataPromise = item.metadataPromise || window.tryRetrieveMetadata(item));
    if (item.collection.category === 'W20' && !item.trustWalletURI) {
        item.trustWalletURI = window.context.trustwalletImgURLTemplate.format(item.sourceAddress);
        await window.AJAXRequest(item.trustWalletURI = window.context.trustwalletImgURLTemplate.format(item.sourceAddress)).then(() => (item.image = item.trustWalletURI));
    }
    item.decimals = item.decimals || await window.blockchainCall(item.token.methods.decimals);
    item.collectionDecimals = item.collectionDecimals || await window.blockchainCall(item.collection.contract.methods["decimals(uint256)"], item.objectId);
    item.dynamicData = item.dynamicData || {};
    return item;
};

export function loadItemCollections(library: any, chainId: any): Promise<TokenList> {
    if(!library || !chainId) {
        return new Promise(ok => ok(null));
    }
    window.networkId && window.networkId !== chainId && delete window.globalCollections;
    window.networkId && window.networkId !== chainId && delete window.ethItemOrchestrator;
    window.networkId && window.networkId !== chainId && delete window.loadCollections;
    window.networkId && window.networkId !== chainId && delete window.itemList;
    window.itemList = window.itemList || {
        name: 'ETHItem List',
        timestamp: new Date().toISOString(),
        version: { major: 1, minor: 0, patch: 0 },
        tokens : [],
        keywords: [],
        logoURI: window.trustwalletImgURLTemplate.split("{0}").join(window.web3.utils.toChecksumAddress("0x34612903db071e888a4dadcaa416d3ee263a87b9")),
        tags: {}
    };
    window.networkId !== chainId && (window.networkId = chainId);
    return window.loadCollections = window.loadCollections || new Promise(async function (ok) {
        if (!window.context) {
            window.context = await (await fetch(window.contextURL)).json();
            window.context.excludingCollections = (window.context.excludingCollections || []).map((it: any) => window.web3.utils.toChecksumAddress(it));
            window.context.pandorasBox = (window.context.pandorasBox || []).map((it: any) => window.web3.utils.toChecksumAddress(it));
            try {
                var pandorasBox = await (await fetch(window.context.pandorasBoxURL)).json();
                window.context.pandorasBox.push(...pandorasBox.map((it: any) => window.web3.utils.toChecksumAddress(it)).filter((it: any) => window.context.pandorasBox.indexOf(it) === -1));
            } catch (e) { }
            try {
                window.ethItemElementImages = await (await fetch(window.context.ethItemElementImagesURL)).json();
            } catch (e) { }
            window.metadatas = [];
            try {
                window.metadatas = await (await fetch(window.context.ethItemMetadatasURL)).json();
            } catch (e) { }
        }
        window.web3.currentProvider = library;
        window.ethItemOrchestrator = window.newContract(window.context.ethItemOrchestratorABI, window.getNetworkElement("ethItemOrchestratorAddress"));
        var collections = await window.loadCollectionsWork();
        var emptyArrayString: string[] = [];
        window.itemList.tokens = collections.map((it: any) => {
            return {
                chainId,
                address: it.address,
                name: it.name,
                decimals: parseInt(it.decimals || 1),
                symbol: it.symbol,
                logoURI: it.image,
                tags: emptyArrayString
            }
        });
        return ok(window.itemList);
    });
}

export function loadItemCollectionsSync(library : any, chainId : any) {
    loadItemCollections(library, chainId);
    return window.itemList || {tokens : []};
}

export function loadItemCollectionTokens(address : any) : Promise<TokenList> {
    address = window.web3.utils.toChecksumAddress(address);
    var collection = window.globalCollections.filter((it : any) => it.address === address)[0];
    collection.tokenList = collection.tokenList || {
        name: `${collection.name} List`,
        timestamp: new Date().toISOString(),
        version: { major: 1, minor: 0, patch: 0 },
        tokens : [],
        keywords: [],
        logoURI: collection.image,
        tags: {}
    }
    return new Promise(async function(ok) {
        if(collection.tokenList.tokens.length === 0) {
            collection.tokenList.tokens = (await window.loadItemCollectionTokensWork(collection)) || [];
        }
        return ok(collection.tokenList);
    });
}

export function loadItemCollectionTokensSync(address : any) {
    loadItemCollectionTokens(address);
    address = window.web3.utils.toChecksumAddress(address);
    var collection = window.globalCollections.filter((it : any) => it.address === address)[0];
    return collection.tokenList;
}

export function getCollectionOfItem(address : any) {
    address = window.web3.utils.toChecksumAddress(address);
    var collection = (window.globalCollections || []).filter((collection : any) => collection.items && Object.values(collection.items).filter((item : any) => item.address === address).length > 0)[0];
    return collection || null;
}

export function getItemData(address : any) {
    address = window.web3.utils.toChecksumAddress(address);
    var collection = getCollectionOfItem(address);
    if(!collection) {
        return null;
    }
    return Object.values(collection.items).filter((item : any) => item.address === address)[0];
}

export enum TokenType {
    ERC20,
    Item
}