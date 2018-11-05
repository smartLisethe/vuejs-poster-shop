'use strict';
var PRICE = 9.99;
var LOAD_NUM = 10;
new Vue({
	el: '#app',
	data: {
		total: 0,
		items: [],
		cart: [],
		results: [],
		search: 'anime',
		lastSearch: '',
		loading: false,
		price: PRICE,
	},
	computed: {
		noMoreItems: function() {
			return this.items.length === this.results.length && this.results.length > 0;
		}
	},
	methods: {
		appendItems: function() {
			if (this.items.length < this.results.length) {
				var append = this.results.slice(this.items.length, this.items.length + LOAD_NUM); // (0, 0+10) - > (10, 10+10)
				this.items = this.items.concat(append);
			}
		},
		onSubmit: function() {
			if(this.search.length) {
				this.items = [];
				this.loading = true; // cargandose 
				this.$http
					.get('/search/'.concat(this.search))
					.then(function(res) {
						this.lastSearch = this.search;
						this.results = res.data;
						this.appendItems();
						this.loading = false; // no cargandose 
					})
				;
			}
		},
		addItem: function(index) {
			this.total += PRICE; 
			var item = this.items[index];
			var found = false; // We haven't found item 
			
			//Iterate through the cart
			for(var i = 0; i < this.cart.length; i++) {
				if (this.cart[i].id === item.id) {
					found = true; // encontre item
					this.cart[i].qty++;
					break;
				}
			}	
			if (!found) {
				this.cart.push({
					id: item.id,
					title: item.title,
					qty: 1,
					price: PRICE
				});
			}
		},
		inc: function(item) {
			item.qty++;
			this.total += PRICE;
		},
		dec: function(item) {
			item.qty--;
			this.total -= PRICE;

			// If decrements below or zero it means the use wants to remove the item from the cart
			if (item.qty <= 0) {
				for (var i = 0; i < this.cart.length; i++) {
					if (this.cart[i].id === item.id) {
						this.cart.splice(i, 1);
						break;
					}
				}
			}
		}
	},
	filters: {
		currency: function(price) {
			return '$'.concat(price.toFixed(2));
		}
	},
	mounted: function() {
		this.onSubmit();
		var _vueInstance = this;
		var elem = document.querySelector('#product-list-bottom');
		var watcher = scrollMonitor.create(elem);
		watcher.enterViewport(function() {
			_vueInstance.appendItems();
		});
	}
});