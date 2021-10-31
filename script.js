/*
 * Please don't look at this code.
 * It was written with my absolute last braincell, 
 * cause the otherones went somewhere else ... 💫 🩸 🧛‍♀️ 🩸 💫
 */

let config = {
    type: Phaser.AUTO,
	parent: 'game',
    width: window.innerWidth * 0.9,
    height: window.innerHeight * 0.75,
	backgroundColor: '#ffffff',
    scene: {
        preload: preload,
        create: create,
    },
};

let game = new Phaser.Game(config);
let colorMode = 'c';
let currentClothingDisplay = undefined;

let clothing = {
	back: {
		equipped: null,
		amount: 3,
	},
	socks: {
		equipped: null,
		amount: 4,
	},
	tops: {
		equipped: null,
		amount: 8,
	},
	pants: {
		equipped: null,
		amount: 6,
	},
	shoes: {
		equipped: null,
		amount: 4,
	},
	bracelets: {
		equipped: null,
		amount: 3,
	},
	dresses: {
		equipped: null,
		amount: 3,
	},
	necklaces: {
		equipped: null,
		amount: 10,
	},
	jackets: {
		equipped: null,
		amount: 8,
	},
	earrings: {
		equipped: null,
		amount: 6,
	},
	hats: {
		equipped: null,
		amount: 3,
	}, 
};

var clothingContainer;
var char;

function preload () {
	let clothingCatSelect = document.getElementById('ui-clothing-cat-select');
	const clothingCategories = Object.keys(clothing);
	clothingCategories.forEach( (itemName) => {
		let btn = document.createElement('button');
		btn.classList.add('btn-category-selection');
		btn.id = itemName;
		btn.addEventListener('click', onClothingSelect);
		let img = document.createElement('img');
		img.id = itemName;
		img.src = `./assets/icons/ico-${itemName}.png`;
		btn.appendChild(img);
		clothingCatSelect.appendChild(btn);
	});

	this.load.image('char-b', `assets/images/char-b.png`);
	this.load.image('char-c', `assets/images/char-c.png`);
}


function create () {
	this.centerX=game.config.width/2;
	this.centerY=game.config.height/2;

	char = this.add.image(this.centerX, this.centerY, `char-${colorMode}`);
	char.setScale(0.75);
	clothingContainer = this.add.container(this.centerX, this.centerY);
	clothingContainer.setScale(0.75);

	Object.keys(clothing).forEach( (item) => {
		let clothingItem = this.add.image(0,0, item);
		clothingItem.setVisible(false);
		clothingItem.setName(item);
		clothing[item].equipped = clothingItem;
		clothingContainer.add(clothingItem);
	});
}

function onClothingSelect (event) {
	const id = event.target.id;
	currentClothingDisplay = id;
	drawClothingPreview(id);
} 

function drawClothingPreview (key) {
	if ( !key ) return;
	const clothingSelect = document.getElementById('ui-clothing-select');
	const clothingItems = clothing[key];

	let trash = document.createElement('img');
	trash.src = './assets/icons/ico-trash.png';
	trash.classList.add('trash');
	trash.id = `trash-${key}`;
	trash.addEventListener('click', handleClothingRemove);
	clothingSelect.replaceChildren(trash);	

	for ( let i = 1; i <= clothingItems.amount; i++ ) {
		let img = document.createElement('img');
		img.src = `./assets/images/previews/prev-${key}-${i}.png`;
		img.classList.add('clothing-item');
		img.id = `${key}-${i}`;
		img.addEventListener('click', addClothing);
		clothingSelect.appendChild(img);
	}
}

function addClothing (event) {
	const item = event.target.id;
	const key = item.split('-')[0];	
	loadClothing(item, key);
}

function checkForCroppedItems (key) {
	if ( key === 'jackets' && (clothing['tops'].equipped.texture.key !== '__MISSING' || clothing['dresses'].equipped.texture.key !== '__MISSING')) {
		let dressTexture = clothing['dresses'].equipped.texture.key;
		let topsTexture = clothing['tops'].equipped.texture.key;
		if ( dressTexture  !== '__MISSING' && !dressTexture.match(/-cut/g) ) loadClothing(`${dressTexture.split('-')[0]}-${dressTexture.split('-')[1]}`, 'dresses');
		if ( topsTexture  !== '__MISSING' &&  !topsTexture.match(/-cut/g) ) loadClothing(`${topsTexture.split('-')[0]}-${topsTexture.split('-')[1]}`, 'tops');
	}
}

function loadClothing (item, key) {
	const scene = game.scene.getScene('default');
	let itemKey = `${item}-${colorMode}`;
	// exception for tops and dresses if jacket is equipped --> cropped version gets loaded
	if ( (key === 'tops' || key === 'dresses') && clothing['jackets'].equipped.texture.key !== '__MISSING') itemKey = `${item}-${colorMode}-cut`;

	if ( !scene.textures.exists(itemKey) ) {
		scene.load.image(itemKey, `/assets/images/${itemKey}.png`);
		scene.load.on('complete', () => {
			if ( !clothing[key].equipped.visible ) clothing[key].equipped.setVisible(true);
			clothing[key].equipped.setTexture(itemKey);
			checkForCroppedItems(key);
			scene.load.removeAllListeners(['complete']);
		}, this);
		scene.load.start();
	} else {
		if ( !clothing[key].equipped.visible ) clothing[key].equipped.setVisible(true);
		clothing[key].equipped.setTexture(itemKey);
		checkForCroppedItems(key);
	}
}

function deleteClothing (key) {
	if ( clothing[key].equipped ) {
		if ( key === 'jackets' && (clothing['tops'].equipped.texture.key !== '__MISSING' || clothing['dresses'].equipped.texture.key !== '__MISSING' )) {
			if ( clothing['tops'].equipped.visibele ) {
				let topsKey = clothing['tops'].equipped.texture.key;
				clothing['tops'].equipped.setTexture(topsKey.substring(0, topsKey.length-4));
			}
			if ( clothing['dresses'].equipped.visibele ) {
				let dressesKey = clothing['dresses'].equipped.texture.key;
				clothing['dresses'].equipped.setTexture(dressesKey.substring(0, dressesKey.length-4));
			}
		}
		clothing[key].equipped.setTexture('');
		clothing[key].equipped.setVisible(false);
	} 
}

function handleClothingRemove (event) {
	deleteClothing(event.target.id.split('-')[1]); 
}

function reset () {
	Object.keys(clothing).forEach( (key) => {
		clothing[key].equipped.setVisible(false);
		clothing[key].equipped.setTexture('');
	});
}

function switchColorMode () {
	colorMode = colorMode === 'c' ? 'b' : 'c';
	char.setTexture(`char-${colorMode}`);
	Object.keys(clothing).forEach( (key) => {
		const itemKey = clothing[key].equipped.texture.key;
		if (itemKey !== '__MISSING') loadClothing(itemKey.substring(0, itemKey.length-2), key);
	});
}

function download () {
	game.renderer.snapshot((snap) => {
		snap.onclick = function(event) {
			const img = event.target;
			const image_data = atob(img.src.split(',')[1]);
			const arraybuffer = new ArrayBuffer(image_data.length);
			const view = new Uint8Array(arraybuffer);
			let blob;
			for (let i=0; i<image_data.length; i++) {
				view[i] = image_data.charCodeAt(i) & 0xff;
			}
			try {
				blob = new Blob([arraybuffer], {type: 'application/octet-stream'});
			} catch (e) {
				const bb = new (window.WebKitBlobBuilder || window.MozBlobBuilder);
				bb.append(arraybuffer);
				blob = bb.getBlob('application/octet-stream');
			}
			var url = (window.webkitURL || window.URL).createObjectURL(blob);
			console.log(url);
			const tmpLink = document.createElement( 'a' );  
			tmpLink.download = `midnightmass-dressup-${Date.now()}.png`; 
			tmpLink.href = url;  
			document.body.appendChild( tmpLink );  
			tmpLink.click();  
			document.body.removeChild( tmpLink );
		};
		snap.click();
	})
}