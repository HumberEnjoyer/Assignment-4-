(function($) {
    $.Shop = function(element) {
        this.$element = $(element);
        this.init();
    };

    $.Shop.prototype = {
        init: function() {
            // Properties

            this.cartPrefix = "shop-"; // Prefix for session storage keys
            this.cartName = this.cartPrefix + "cart"; // Cart key in session storage
            this.shippingRates = this.cartPrefix + "shipping-rates"; // Shipping rates key
            this.total = this.cartPrefix + "total"; // Total key
            this.storage = sessionStorage; // Reference to sessionStorage

            // Cached jQuery selectors
            this.$formAddToCart = this.$element.find("form.add-to-cart");
            this.$formCart = this.$element.find("#shopping-cart");
            this.$checkoutCart = this.$element.find("#checkout-cart");
            this.$checkoutOrderForm = this.$element.find("#checkout-order-form");
            this.$shipping = this.$element.find("#sshipping");
            this.$subTotal = this.$element.find("#stotal");
            this.$shoppingCartActions = this.$element.find("#shopping-cart-actions");
            this.$updateCartBtn = this.$shoppingCartActions.find("#update-cart");
            this.$emptyCartBtn = this.$shoppingCartActions.find("#empty-cart");
            this.$userDetails = this.$element.find("#user-details-content");
            this.$paypalForm = this.$element.find("#paypal-form");

            // Currency and PayPal settings
            this.currency = "$"; // Currency symbol
            this.currencyString = "$"; // Currency string for parsing
            this.paypalCurrency = "USD"; // PayPal currency code
            this.paypalBusinessEmail = "yourbusiness@email.com"; // Your PayPal business email
            this.paypalURL = "https://www.paypal.com/cgi-bin/webscr"; // PayPal form URL

            // Validation patterns
            this.requiredFields = {
                expression: {
                    value: /^([\w-\.]+)@((?:[\w]+\.)+)([a-zA-Z]{2,4})$/
                },
                str: {
                    value: ""
                }
            };

            // Initialize the cart
            this.createCart();
            this.handleAddToCartForm();
            this.handleCheckoutOrderForm();
            this.emptyCart();
            this.updateCart();
            this.displayCart();
            this.deleteProduct();
            this.displayUserDetails();
            this.populatePayPalForm();
        },

        // Creates the cart in session storage
        createCart: function() {
            if (this.storage.getItem(this.cartName) == null) {
                var cart = { items: [] };
                this.storage.setItem(this.cartName, this._toJSONString(cart));
                this.storage.setItem(this.shippingRates, "0");
                this.storage.setItem(this.total, "0");
            }
        },

        // Populates the PayPal form with cart data
        populatePayPalForm: function() {
            var self = this;
            if (self.$paypalForm.length) {
                var $form = self.$paypalForm;
                var cart = self._toJSONObject(self.storage.getItem(self.cartName));
                var shipping = self.storage.getItem(self.shippingRates);
                var numShipping = self._convertString(shipping);
                var cartItems = cart.items;
                var singleShipping = cartItems.length > 0 ? (numShipping / cartItems.length) : 0;

                $form.attr("action", self.paypalURL);
                $form.find("input[name='business']").val(self.paypalBusinessEmail);
                $form.find("input[name='currency_code']").val(self.paypalCurrency);

                for (var i = 0; i < cartItems.length; ++i) {
                    var cartItem = cartItems[i];
                    var n = i + 1;
                    var name = cartItem.product;
                    var price = self._formatNumber(cartItem.price, 2);
                    var qty = cartItem.qty;
                    var shippingCost = self._formatNumber(singleShipping, 2);

                    $("<input>").attr({
                        type: 'hidden',
                        name: 'item_name_' + n,
                        value: name
                    }).appendTo($form);
                    $("<input>").attr({
                        type: 'hidden',
                        name: 'amount_' + n,
                        value: price
                    }).appendTo($form);
                    $("<input>").attr({
                        type: 'hidden',
                        name: 'quantity_' + n,
                        value: qty
                    }).appendTo($form);
                    $("<input>").attr({
                        type: 'hidden',
                        name: 'shipping_' + n,
                        value: shippingCost
                    }).appendTo($form);
                }
            }
        },

        // Displays the user's billing and shipping details
        displayUserDetails: function() {
            if (this.$userDetails.length) {
                var name = this.storage.getItem("billing-name");
                var email = this.storage.getItem("billing-email");
                var city = this.storage.getItem("billing-city");
                var address = this.storage.getItem("billing-address");
                var zip = this.storage.getItem("billing-zip");
                var country = this.storage.getItem("billing-country");

                var html = "<div class='detail'>";
                html += "<h2>Billing Details</h2>";
                html += "<ul>";
                html += "<li>Name: " + name + "</li>";
                html += "<li>Email: " + email + "</li>";
                html += "<li>City: " + city + "</li>";
                html += "<li>Address: " + address + "</li>";
                html += "<li>ZIP: " + zip + "</li>";
                html += "<li>Country: " + country + "</li>";
                html += "</ul></div>";

                if (this.storage.getItem("shipping-name")) {
                    var sName = this.storage.getItem("shipping-name");
                    var sEmail = this.storage.getItem("shipping-email");
                    var sCity = this.storage.getItem("shipping-city");
                    var sAddress = this.storage.getItem("shipping-address");
                    var sZip = this.storage.getItem("shipping-zip");
                    var sCountry = this.storage.getItem("shipping-country");

                    html += "<div class='detail'>";
                    html += "<h2>Shipping Details</h2>";
                    html += "<ul>";
                    html += "<li>Name: " + sName + "</li>";
                    html += "<li>Email: " + sEmail + "</li>";
                    html += "<li>City: " + sCity + "</li>";
                    html += "<li>Address: " + sAddress + "</li>";
                    html += "<li>ZIP: " + sZip + "</li>";
                    html += "<li>Country: " + sCountry + "</li>";
                    html += "</ul></div>";
                }

                this.$userDetails.html(html);
            }
        },

        // Deletes a product from the cart
        deleteProduct: function() {
            var self = this;
            if (self.$formCart.length) {
                $(document).on("click", ".pdelete a", function(e) {
                    e.preventDefault();
                    var productName = $(this).data("product");
                    var cart = self._toJSONObject(self.storage.getItem(self.cartName));
                    var items = cart.items;
                    var index = items.findIndex(function(item) {
                        return item.product === productName;
                    });

                    if (index !== -1) {
                        items.splice(index, 1);
                        self.storage.setItem(self.cartName, self._toJSONString(cart));
                        self._updateCartTotals();
                        $(this).closest("tr").remove();
                    }
                });
            }
        },

        // Displays the cart in the shopping cart table
        displayCart: function() {
            if (this.$formCart.length) {
                var cart = this._toJSONObject(this.storage.getItem(this.cartName));
                var items = cart.items;
                var $tableCartBody = this.$formCart.find(".shopping-cart tbody");
                $tableCartBody.empty();

                if (items.length === 0) {
                    $tableCartBody.html("<tr><td colspan='4'>Your cart is empty.</td></tr>");
                } else {
                    var self = this;
                    items.forEach(function(item) {
                        var product = item.product;
                        var price = self.currency + " " + self._formatNumber(item.price, 2);
                        var qty = item.qty;
                        var html = "<tr>";
                        html += "<td class='pname'>" + product + "</td>";
                        html += "<td class='pqty'><input type='number' value='" + qty + "' class='qty' min='1'/></td>";
                        html += "<td class='pprice'>" + price + "</td>";
                        html += "<td class='pdelete'><a href='' data-product='" + product + "'>&times;</a></td>";
                        html += "</tr>";
                        $tableCartBody.append(html);
                    });

                    // Update subtotal
                    this.$subTotal.text(this.currency + " " + this.storage.getItem(this.total));
                }
            }
        },

        // Empties the cart
        emptyCart: function() {
            var self = this;
            if (self.$emptyCartBtn.length) {
                self.$emptyCartBtn.on("click", function(e) {
                    e.preventDefault();
                    self._emptyCart();
                    self.displayCart();
                });
            }
        },

        // Updates the cart quantities and totals
        updateCart: function() {
            var self = this;
            if (self.$updateCartBtn.length) {
                self.$updateCartBtn.on("click", function(e) {
                    e.preventDefault();
                    var $rows = self.$formCart.find("tbody tr");
                    var cart = { items: [] };
                    var updatedTotal = 0;
                    var totalQty = 0;

                    $rows.each(function() {
                        var $row = $(this);
                        var pname = $.trim($row.find(".pname").text());
                        var pqty = self._convertString($row.find(".pqty .qty").val());
                        var pprice = self._convertString(self._extractPrice($row.find(".pprice")));

                        if (pqty > 0) {
                            cart.items.push({
                                product: pname,
                                price: pprice,
                                qty: pqty
                            });
                            updatedTotal += pqty * pprice;
                            totalQty += pqty;
                        }
                    });

                    self.storage.setItem(self.cartName, self._toJSONString(cart));
                    self.storage.setItem(self.total, self._convertNumber(updatedTotal));
                    self.storage.setItem(self.shippingRates, self._convertNumber(self._calculateShipping(totalQty)));
                    self.displayCart();
                });
            }
        },

        // Handles adding items to the cart
        handleAddToCartForm: function() {
            var self = this;
            self.$formAddToCart.each(function() {
                var $form = $(this);

                $form.on("submit", function(event) {
                    event.preventDefault();

                    var qty = parseInt($form.find("input[name='qty']").val()) || 1;
                    var price = parseFloat($form.find("input[name='price']").val());
                    var name = $form.find("input[name='product']").val();

                    if (!name || isNaN(price)) {
                        console.error("Product name or price is missing or invalid.");
                        return;
                    }

                    var cart = self._toJSONObject(self.storage.getItem(self.cartName));
                    var items = cart.items;
                    var exists = false;

                    for (var i = 0; i < items.length; i++) {
                        if (items[i].product === name) {
                            items[i].qty += qty;
                            exists = true;
                            break;
                        }
                    }

                    if (!exists) {
                        items.push({
                            product: name,
                            price: price,
                            qty: qty
                        });
                    }

                    self.storage.setItem(self.cartName, self._toJSONString(cart));
                    self._updateCartTotals();
                    self.displayCart();

                    // Update cart item count in the navbar or cart link
                    $(".navbar-nav .nav-link:contains('Cart')").text("Cart (" + self._getTotalQty() + ")");
                });
            });
        },

        // Handles the checkout order form
        handleCheckoutOrderForm: function() {
            var self = this;
            if (self.$checkoutOrderForm.length) {
                var $sameAsBilling = $("#same-as-billing");
                $sameAsBilling.on("change", function() {
                    if ($(this).prop("checked")) {
                        $("#fieldset-shipping").slideUp();
                    } else {
                        $("#fieldset-shipping").slideDown();
                    }
                });

                self.$checkoutOrderForm.on("submit", function(event) {
                    event.preventDefault();
                    var $form = $(this);
                    var valid = self._validateForm($form);

                    if (valid) {
                        self._saveFormData($form);
                        // Redirect to confirmation or next step
                        window.location.href = "confirmation.html";
                    }
                });
            }
        },

        // Private methods

        // Empties the cart in session storage
        _emptyCart: function() {
            this.storage.removeItem(this.cartName);
            this.storage.removeItem(this.total);
            this.storage.removeItem(this.shippingRates);
            this.createCart();
        },

        // Formats a number to a fixed decimal places
        _formatNumber: function(num, places) {
            return num.toFixed(places);
        },

        // Extracts numeric value from a price string
        _extractPrice: function(element) {
            var text = element.text();
            var price = text.replace(this.currencyString, "").trim();
            return price;
        },

        // Converts a numeric string to a number
        _convertString: function(numStr) {
            var num = parseFloat(numStr);
            return isNaN(num) ? 0 : num;
        },

        // Converts a number to a string
        _convertNumber: function(n) {
            return n.toString();
        },

        // Parses JSON string to an object
        _toJSONObject: function(str) {
            return JSON.parse(str);
        },

        // Converts an object to JSON string
        _toJSONString: function(obj) {
            return JSON.stringify(obj);
        },

        // Updates the cart totals in session storage
        _updateCartTotals: function() {
            var cart = this._toJSONObject(this.storage.getItem(this.cartName));
            var items = cart.items;
            var total = 0;
            var totalQty = 0;

            items.forEach(function(item) {
                total += item.price * item.qty;
                totalQty += item.qty;
            });

            this.storage.setItem(this.total, this._convertNumber(total));
            this.storage.setItem(this.shippingRates, this._convertNumber(this._calculateShipping(totalQty)));
        },

        // Calculates the shipping rates based on total quantity
        _calculateShipping: function(qty) {
            var shipping = 0;
            if (qty >= 6 && qty < 12) {
                shipping = 10;
            } else if (qty >= 12 && qty <= 30) {
                shipping = 20;
            } else if (qty > 30 && qty <= 60) {
                shipping = 30;
            } else if (qty > 60) {
                shipping = 0;
            }
            return shipping;
        },

        // Validates the checkout form
        _validateForm: function(form) {
            var self = this;
            var fields = self.requiredFields;
            var valid = true;
            var $visibleSet = form.find("fieldset:visible");

            form.find(".message").remove();

            $visibleSet.find(":input[data-type]").each(function() {
                var $input = $(this);
                var type = $input.data("type");
                var msg = $input.data("message");
                var value = $input.val();

                if (type === "string" && value.trim() === "") {
                    $("<span class='message'/>").text(msg).insertBefore($input);
                    valid = false;
                } else if (type === "email" && !fields.expression.value.test(value)) {
                    $("<span class='message'/>").text(msg).insertBefore($input);
                    valid = false;
                }
            });

            return valid;
        },

        // Saves the form data to session storage
        _saveFormData: function(form) {
            var self = this;
            var $visibleSet = form.find("fieldset:visible");

            $visibleSet.each(function() {
                var $set = $(this);
                var prefix = $set.attr("id") === "fieldset-billing" ? "billing-" : "shipping-";

                $set.find(":input").each(function() {
                    var $input = $(this);
                    var key = prefix + $input.attr("name");
                    var value = $input.val();
                    self.storage.setItem(key, value);
                });
            });
        },

        // Calculates the total quantity of items in the cart
        _getTotalQty: function() {
            var cart = this._toJSONObject(this.storage.getItem(this.cartName));
            var items = cart.items;
            var totalQty = 0;

            items.forEach(function(item) {
                totalQty += item.qty;
            });

            return totalQty;
        }
    };

    // Initialize the shop
    $(function() {
        var shop = new $.Shop("#site");
    });
})(jQuery);
