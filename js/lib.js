const lib = {
	cutlines: {
		1: 'LIVE',
		2: 'DOWN'
	},
	states: {
		1: 'Turn On',
		2: 'Turn Off',
		3: 'Removed',
		4: 'Default',
		5: 'Coming Soon'
	},
	NM: {
		header: 'Patches are',
		domains: ['https://wn.ref1.nmg/', 'https://www.neimanmarcus.com/'],
		types: {
			1: 'Header Promos (Contentful)',
			2: 'Intl Header Promos (Contentful)',
			3: 'Homepage (Contentful)',
			4: 'Intl Homepage (Contentful)',
			5: 'Drawer Tickers (Contentful)',
			6: 'Designer Indexes (Contentful)',
			7: 'Silo Graphic Headers (Contentful)',
			8: 'Landing Pages (Contentful)',
			9: 'Entry Pages (Contentful)',
			10: 'Graphic Headers (Contentful)',
			11: 'Silo Banners (Cloudinary)',
			12: 'Promo Tiles (Cloudinary)',
			13: 'Popups (ATG)',
			14: 'Videos (ATG)',
			15: 'Checkout (ATG)',
			16: 'PDP Banners (Contentful)'
		}
	},
	'LB/MAG': {
		header: 'Lookbook/Magazine is',
		domains: ['https://www.neimanmarcus.com/'],
		types: {
			1: 'Lookbook (Contentful)',
			2: 'Magazine (Contentful)',
			3: 'Graphic Header (Cloudinary)',
			4: 'Silo Banner (Cloudinary)',
			5: 'Promo Tile (Cloudinary)'
		}
	},
	SS: {
		header: 'Merchant Site Support is',
		domains: ['https://author-neimanmarcus-prod.adobecqms.net/mnt/overlay/dam/gui/content/collections.html/content/dam/collections'],
		types: {
			1: 'Graphic Header (Cloudinary)',
			2: 'Silo Banner (Cloudinary)',
			3: 'Promo Tile (Cloudinary)'
		}
	},
	HC: {
		header: 'Patches are',
		domains: ['https://whref1/', 'https://www.horchow.com/'],
		types: {
			1: 'Header Promos',
			2: 'Homepage',
			3: 'Drawer Tickers',
			4: 'Graphic Headers',
			5: 'Other'
		}
	},
	LC: {
		header: 'Patches are',
		domains: ['https://lcref1/', 'https://www.lastcall.com/'],
		types: {
			1: 'Header Promos',
			2: 'Homepage',
			3: 'Drawers',
			4: 'Silos',
			5: 'Silo Bottom Bars',
			6: 'Promo Tiles',
			7: 'Popups',
			8: 'Other'
		}
	},
	APP: {
		header: 'Patches are',
		domains: ['https://wn.test3.nmg/', 'https://www.neimanmarcus.com/'],
		types: {
			1: 'Home Screen',
			2: 'Stores'
		}
	},
	NTF: {
		header: 'App Notifications are',
		domains: ['https://www.neimanmarcus.com/'],
		types: {
			1: 'Image',
			2: 'PUSH',
			3: 'PULL<br>[message center title]',
			4: '[image copy]',
			5: '[supporting copy]',
			6: '[button]'
		}
	}
}