import { ethers } from 'ethers';
import { getContract } from 'utils';
import { TokenList } from '@uniswap/token-lists'

const abi = new ethers.utils.AbiCoder();
const window: any = global;

if (!window.String.prototype.format) {
    window.String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match : any, number : any) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

if (!window.String.prototype.firstLetterToUpperCase) {
    window.String.prototype.firstLetterToUpperCase = function() {
        if (this.replaceAll(" ", "") === '') {
            return this;
        } else {
            var s = this.charAt(0).toUpperCase();
            if (this.length > 1) {
                s += this.substring(1);
            }
            return s;
        }
    };
}

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
window.traitTypesTemplatesURL = window.traitTypesTemplatesURL || "https://raw.githubusercontent.com/EthereansOS/ITEMS-Interface/main/data/traitTypesTemplates.json";
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

window.setData = window.setData || function setData(root: any, data : any) {
    if (!root || !data) {
        return;
    }
    var children = [...root.getElementsByTagName('input'), ...root.getElementsByTagName('select'), ...root.getElementsByTagName('textarea')];
    children.forEach(function(input: any, i: any) {
        var id = input.id || i;
        !input.type || input.type !== 'checkbox' && input.type !== 'radio' && input.type !== 'file' && (input.value = data[id]);
        input.type && (input.type === 'checkbox' || input.type === 'radio') && (input.checked = data[id] === true);
        input.type === 'file' && (input.files = data[id]);
    });
};

window.getData = window.getData || function getData(root : any, checkValidation : any) {
    if (!root) {
        return;
    }
    var data : any= {};
    var children = [...root.getElementsByTagName('input'), ...root.getElementsByTagName('select'), ...root.getElementsByTagName('textarea')];
    children.forEach(function(input : any, i: any) {
        var id = ((input.id || i) + '').split('.');
        var value;
        input.type && input.type !== 'checkbox' && (value = input.value);
        input.type === 'number' && (value = parseFloat(value.split(',').join('')));
        input.type === 'number' && isNaN(value) && (value = parseFloat((input.dataset.defaultValue || '').split(',').join('')));
        (input.type === 'checkbox' || input.type === 'radio') && (value = input.checked);
        !input.type || input.type === 'hidden' && (value = input.value);
        input.type === 'file' && (value = input.files);
        if (checkValidation) {
            if (!value) {
                throw "Data is mandatory";
            }
            if (input.type === 'number' && isNaN(value)) {
                throw "Number is mandatory";
            }
        }
        var x : any = data;
        x = x;
        while (id.length > 0) {
            var partialId = id.pop();
            x = data[partialId] = data[partialId] || id.length === 0 ? value : {};
        }
    });

    return data;
};

window.perform = window.perform || function perform(e : any) {
    window.preventItem(e);
    var target = e.currentTarget;
    var view = target.view;
    if ((view.state && view.state.performing) || target.className.toLowerCase().indexOf('disabled') !== -1) {
        return;
    }
    var action = target.dataset.action;
    var args : any = [];
    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    var _this = view;
    var close = function close(e : any) {
        var message = e !== undefined && e !== null && (e.message || e);
        _this.setState({ performing: null, loadingMessage: null }, function() {
            message && message.indexOf('denied') === -1 && setTimeout(function() {
                alert(message);
            });
            !message && _this.actionEnd && _this.actionEnd();
        });
    }
    _this.setState({ performing: action }, function() {
        _this.controller['perform' + action.firstLetterToUpperCase()].apply(view, args).catch(close).finally(close);
    });
};

window.checkMetadataValuesForItem = async function checkMetadataValuesForItem(metadata : any) {
    var errors = [];

    if (!await window.checkCoverSize(metadata.image)) {
        errors.push(`Cover size cannot have a width greater than ${window.context.imageMaxWidth} pixels and a size greater than ${window.context.imageMaxWeightInMB} MB`);
    }

    if (!metadata.description) {
        errors.push(`Description is mandatory`);
    }

    if (!metadata.background_color) {
        errors.push(`Background color is mandatory`);
    }

    if (errors && errors.length > 0) {
        throw errors.join(',');
    }

    return true;
};

window.uploadMetadata = window.uploadMetadata || async function uploadMetadata(metadata : any) {
    var cleanMetadata = await window.prepareMetadata(metadata);
    await window.normalizeMetadata(cleanMetadata);
    return await window.uploadToIPFS(cleanMetadata);
};

window.normalizeMetadata = window.normalizeMetadata || async function normalizeMetadata(metadata : any) {
    if (metadata.image && metadata.image instanceof Array) {
        metadata.image = metadata.image[0];
        if (metadata.image && metadata.image.toLowerCase().indexOf("ipfs://ipfs/") !== -1) {
            metadata.image = "https://ipfs.io/ipfs/" + metadata.image.split("ipfs://ipfs/")[1];
        }
    }
    if (metadata.image_data && metadata.image_data instanceof Array) {
        metadata.image_data = metadata.image_data[0];
        if (metadata.image_data && metadata.image_data.toLowerCase().indexOf("ipfs://ipfs/") !== -1) {
            metadata.image_data = "https://ipfs.io/ipfs/" + metadata.image_data.split("ipfs://ipfs/")[1];
        }
    }
    if (metadata.animation_url && metadata.animation_url instanceof Array) {
        metadata.animation_url = metadata.animation_url[0];
        if (metadata.animation_url && metadata.animation_url.toLowerCase().indexOf("ipfs://ipfs/") !== -1) {
            metadata.animation_url = "https://ipfs.io/ipfs/" + metadata.animation_url.split("ipfs://ipfs/")[1];
        }
    }
    if (metadata.file && metadata.file instanceof Array) {
        metadata.file = metadata.file[0];
        if (metadata.file && metadata.file.toLowerCase().indexOf("ipfs://ipfs/") !== -1) {
            metadata.file = "https://ipfs.io/ipfs/" + metadata.file.split("ipfs://ipfs/")[1];
        }
    }
    
    if (metadata.pro_url && metadata.pro_url instanceof Array) {
        metadata.pro_url = metadata.pro_url[0];
        if (metadata.pro_url && metadata.pro_url.toLowerCase().indexOf("ipfs://ipfs/") !== -1) {
            metadata.pro_url = "https://ipfs.io/ipfs/" + metadata.pro_url.split("ipfs://ipfs/")[1];
        }
    }
    if (metadata.specials_url && metadata.specials_url instanceof Array) {
        metadata.specials_url = metadata.specials_url[0];
        if (metadata.specials_url && metadata.specials_url.toLowerCase().indexOf("ipfs://ipfs/") !== -1) {
            metadata.specials_url = "https://ipfs.io/ipfs/" + metadata.specials_url.split("ipfs://ipfs/")[1];
        }
    }
    if (metadata.soundtrack_file && metadata.soundtrack_file instanceof Array) {
        metadata.soundtrack_file = metadata.soundtrack_file[0];
        if (metadata.soundtrack_file && metadata.soundtrack_file.toLowerCase().indexOf("ipfs://ipfs/") !== -1) {
            metadata.soundtrack_file = "https://ipfs.io/ipfs/" + metadata.soundtrack_file.split("ipfs://ipfs/")[1];
        }
    }
    if (metadata.gameitem_url && metadata.gameitem_url instanceof Array) {
        metadata.gameitem_url = metadata.gameitem_url[0];
        if (metadata.gameitem_url && metadata.gameitem_url.toLowerCase().indexOf("ipfs://ipfs/") !== -1) {
            metadata.gameitem_url = "https://ipfs.io/ipfs/" + metadata.gameitem_url.split("ipfs://ipfs/")[1];
        }
    }
    if (metadata.voxel_url && metadata.voxel_url instanceof Array) {
        metadata.voxel_url = metadata.voxel_url[0];
        if (metadata.voxel_url && metadata.voxel_url.toLowerCase().indexOf("ipfs://ipfs/") !== -1) {
            metadata.voxel_url = "https://ipfs.io/ipfs/" + metadata.voxel_url.split("ipfs://ipfs/")[1];
        }
    }
    if (metadata.folder && metadata.folder instanceof Array) {
        metadata.folder = metadata.folder[metadata.folder.length - 1];
        if (metadata.folder && metadata.folder.toLowerCase().indexOf("ipfs://ipfs/") !== -1) {
            metadata.folder = "https://ipfs.io/ipfs/" + metadata.folder.split("ipfs://ipfs/")[1];
        }
    }
    if (metadata.soundtrack_folder && metadata.soundtrack_folder instanceof Array) {
        metadata.soundtrack_folder = metadata.soundtrack_folder[metadata.soundtrack_folder.length - 1];
        if (metadata.soundtrack_folder && metadata.soundtrack_folder.toLowerCase().indexOf("ipfs://ipfs/") !== -1) {
            metadata.soundtrack_folder = "https://ipfs.io/ipfs/" + metadata.soundtrack_folder.split("ipfs://ipfs/")[1];
        }
    }
    
    if (metadata.licence_url && metadata.licence_url instanceof Array) {
        metadata.licence_url = metadata.licence_url[0];
        if (metadata.licence_url && metadata.licence_url.toLowerCase().indexOf("ipfs://ipfs/") !== -1) {
            metadata.licence_url = "https://ipfs.io/ipfs/" + metadata.licence_url.split("ipfs://ipfs/")[1];
        }
    }
    delete metadata.fileType;
    var keys = Object.keys(metadata);
    for (var key of keys) {
        if (metadata[key] === "" || metadata[key] === undefined || metadata[key] === null) {
            delete metadata[key];
        }
    }
};

window.prepareMetadata = window.prepareMetadata || async function prepareMetadata(data : any) {
    if (data instanceof FileList) {
        if (data.length === 0) {
            return "";
        }
        return await window.uploadToIPFS(data);
    }
    if (data instanceof Array) {
        var array = [];
        for (var item of data) {
            array.push(await window.prepareMetadata(item));
        }
        return array;
    }
    if ((typeof data).toLowerCase() === 'object') {
        var newData : any = {};
        var entries = Object.entries(data);
        for (var entry of entries) {
            newData[entry[0]] = await window.prepareMetadata(entry[1]);
        }
        return newData;
    }
    return data;
};

window.checkCoverSize = window.checkCoverSize || async function checkCoverSize(file : any) {
    var cover : any;
    if ((typeof file).toLowerCase() === "string") {
        cover = await window.downloadBase64Image(window.formatLink(file));
    } else {
        cover = file.size ? file : file.item ? file.item(0) : file.get(0);
    }
    return await new Promise(function(ok) {
        var reader = new FileReader();
        reader.addEventListener("load", function() {
            var image = new Image();
            image.onload = function onload() {
                var byteLength = window.parseInt(reader.result.toString().substring(reader.result.toString().indexOf(',') + 1).replace(/=/g, "").length * 0.75);
                var mBLength = byteLength / 1024 / 1024;
                return ok(image.width <= window.context.imageMaxWidth && mBLength <= window.context.imageMaxWeightInMB);
            };
            image.src = (window.URL || window.webkitURL).createObjectURL(cover);
        }, false);
        reader.readAsDataURL(cover);
    });
};

window.downloadBase64Image = window.downloadBase64Image || function downloadBase64Image(url : any) {
    return new Promise(function(ok, ko) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                return ok(this.response);
            }
            if (this.readyState === 4 && (!this.status || this.status >= 300)) {
                return ko(this.status);
            }
        }
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    });
};

window.uploadToIPFS = window.uploadToIPFS || async function uploadToIPFS(files : any) {
    var single = !(files instanceof Array) && (!(files instanceof FileList) || files.length === 0);
    files = single ? [files] : files;
    var list = [];
    for (var i = 0; i < files.length; i++) {
        var file = files.item ? files.item(i) : files[i];
        if (!(file instanceof File) && !(file instanceof Blob)) {
            file = new Blob([JSON.stringify(file, null, 4)], { type: "application/json" });
        }
        list.push(file);
    }
    var hashes = [];
    window.api = window.api || new window.IpfsHttpClient({ host : 'ipfs.infura.io', port : 5001, protocol : 'https'});
    var i = 0;
    var response = await window.api.add(list, { pin: true, wrapWithDirectory: list.length > 1 });
    response = response instanceof Array ? response : [response];
    for (var upload of response) {
        console.log(upload);
        var hash = upload.path || upload.cid.string;
        if (list.length === 1 || i === list.length) {
            hashes.push(window.context.ipfsUrlTemplates[0] + hash);
        }
        i++;
    }
    return single ? hashes[0] : hashes;
};

window.newContract = window.newContract || function newContract(abi: any, address: any) {
    window.contracts = window.contracts || {};
    var key = window.web3.utils.sha3(JSON.stringify(abi));
    var contracts = (window.contracts[key] = window.contracts[key] || {});
    address = address || window.voidEthereumAddress;
    key = address.toLowerCase();
    contracts[key] = contracts[key] || getContract(address === window.voidEthereumAddress ? undefined : address, abi, window.web3.currentProvider, window.walletAddress);
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
    topics.push([Object.keys(map).filter(key => map[key].indexOf("721") !== -1), [], [window.web3.eth.abi.encodeParameter("uint256", "2"),window.web3.eth.abi.encodeParameter("uint256", "3")]])
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
                item.metadata = item.metadataLink.startsWith("data:application/json;base64,") ? JSON.parse(window.atob(item.metadataLink.substring("data:application/json;base64,".length))) : await window.AJAXRequest(window.formatLink(item.metadataLink));
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
        if(collection.category === 'W20') {
            collectionAddress = window.globalCollections.filter((it: any) => it.category === 'W20').map((it : any) => it.address);
        }
        if(collection.category === 'Native' && collection.symbol === 'cFARM') {
            collectionAddress = window.globalCollections.filter((it: any) => it.category === 'Native' && it.symbol === 'cFARM').map((it : any) => it.address);
        }
    }
    window.itemObjectIdLinker = window.itemObjectIdLinker || {};
    if(!collectionAddress || collectionAddress.length === 0) {
        return [];
    }
    var logs = (await window.getLogs({
        address: collectionAddress,
        topics: [window.web3.utils.sha3("NewItem(uint256,address)")]
    })) || [];
    (logs.length === 0 || collectionAddress instanceof Array) && logs.push(...(await window.getLogs({
        address: collectionAddress,
        topics: [window.web3.utils.sha3("Mint(uint256,address,uint256)")]
    })));
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
};

window.loadItemData = window.loadItemData || async function loadItemData(item : any, collection : any) {
    item = item || {};
    item.dynamicData = item.dynamicData || {};
    collection = collection || item.collection;
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

window.loadSingleCollection = window.loadSingleCollection || async function loadSingleCollection(collectionAddress : any, full : any) {
    collectionAddress = window.web3.utils.toChecksumAddress(collectionAddress);
    if (window.context.excludingCollections.indexOf(collectionAddress) !== -1) {
        return null;
    }
    var map : any = {};
    Object.entries(window.context.ethItemFactoryEvents).forEach((it : any) => map[window.web3.utils.sha3(it[0])] = it[1]);
    var topics = [
        Object.keys(map), [],
        [],
        window.web3.eth.abi.encodeParameter('address', collectionAddress)
    ];
    var address = await window.blockchainCall(window.ethItemOrchestrator.methods.factories);
    var logs = await window.getLogs({
        address,
        topics
    }, true);
    try {
        var modelAddress = window.web3.eth.abi.decodeParameter("address", logs[0].topics[1]);
        var collection = await window.refreshSingleCollection(window.packCollection(collectionAddress, map[logs[0].topics[0]], modelAddress));
        if (full) {
            try {
                var promises = [];
                collection.items = collection.items || {};
                var collectionObjectIds = await window.loadCollectionItems(collection.address);
                for (var objectId of collectionObjectIds) {
                    promises.push(window.loadItemData(collection.items[objectId] = collection.items[objectId] || {
                        objectId,
                        collection
                    }, collection));
                }
                await Promise.all(promises);
            } catch (e) {}
        }
        return collection;
    } catch (e) {
        return null;
    }
};

window.preventItem = window.preventItem || function preventItem(e : any) {
    if (!e) {
        return;
    }
    e.preventDefault && e.preventDefault(true);
    e.stopPropagation && e.stopPropagation(true);
    return e || true;
};

window.asNumber = window.asNumber || function asNumber(value : any) {
    if (typeof value === 'undefined' || value === '') {
        return 0;
    }
    try {
        value = value.split(',').join('');
    } catch (e) {}
    return parseFloat(window.numberToString(value));
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
        window.walletAddress = (await library.send("eth_accounts"))[0];
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
            try {
                window.traitTypesTemplates = await (await fetch(window.traitTypesTemplatesURL)).json();
            } catch (e) { }
        }
        window.context.W1155GroupMode = true;
        window.web3.currentProvider = library;
        window.ethItemOrchestrator = window.newContract(window.context.ethItemOrchestratorABI, window.getNetworkElement("ethItemOrchestratorAddress"));
        await window.loadCollectionsWork();
        window.globalCollections.filter((it : any) => it.image === null || it.image === undefined).forEach((it :any) => it.image = "https://raw.githubusercontent.com/EthereansOS/ITEMS-Interface/main/" + window.getElementImage(it));
        var allCollections = [window.globalCollections.filter((it : any) => it.category === 'W20')[0]];
        var collections = window.globalCollections.filter((it : any) => it.category !== 'W20');
        if(window.context.W1155GroupMode === true) {
            var sub = collections.filter((it : any) => it.category === 'W1155');
            sub.forEach((it : any) => collections.splice(collections.indexOf(it), 1));
            var subs : any = {};
            for(var collection of sub) {
                (subs[collection.sourceAddress] = (subs[collection.sourceAddress] || [])).push(collection);
            }
            Object.values(subs).forEach((it : any) => collections.unshift(it[0]));
        }
        var sub = collections.filter((it : any) => it.symbol === 'cFARM');
        sub.forEach((it : any) => collections.splice(collections.indexOf(it), 1));
        collections.push(sub[0]);
        allCollections.push(... collections);
        var emptyArrayString: string[] = [];
        window.itemList.tokens = allCollections.map((it: any) => {
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
    window.loadItemCollectionTokensPromises = window.loadItemCollectionTokensPromises || {};
    return window.loadItemCollectionTokensPromises[address] = window.loadItemCollectionTokensPromises[address] || new Promise(async function(ok) {
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

export function getPenguinCollectionAddress(chainId : any) : string {
    return chainId === 1 ? "0x00Db0A483220C9916A354FAE50BE42BFe6C2E0AF" : "0x7fc079AfDc00ae4db292c8CDfdEB3359bF0699Df";
}

export function getPenguinCollectionWrapLink() {
    return "https://ethitem.com/?section=wrap";
}

export function getPenguinCollectionCreateLink(chainId : any) {
    return "https://ethitem.com/?section=create&collectionAddress=" + getPenguinCollectionAddress(chainId);
}