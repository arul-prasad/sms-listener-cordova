'use strict';
angular.module('money-tracker', ['ionic', 'controllers', 'services'])
	.run(function ($ionicPlatform) {
		$ionicPlatform.ready(function () {
			if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}
			if (window.statusBar) {
				StatusBar.styleLightContent();
			}
			
			/* Init Couch DB */
			var coax = require("coax"),
				appDbName = "sms";

			function setupDb(db, cb) {
				db.get(function(err, res, body){
					console.log(JSON.stringify(["before create db put", err, res, body]))
					db.put(function(err, res, body){
						db.get(cb)
					})
				})
			};
			
			function setupViews(db,cb) {
				var design = "_design/expenseTrackNew"
				db.put(design, {
					views : {
						expenseTrackListsNew : {
							map : function(doc) {
								if (doc.trackType == "expense" && doc.date && doc.merchant && doc.amount) {
									emit(doc.date, doc);
								}
							}.toString()
						}
					}
				}, function(){
					cb(false, db([design, "_view"]))
				});
			};

			if (cblite) {
				cblite.getURL(function(err, url) {
					if (err) {
						console.log('db not initialized');
					} else {
						window.server = coax(url);
						var db = coax([url, appDbName]);
						var setUpDbCb = function(err, info) {
							if (err) {
								console.log('err', err, info);
							} else {
								setupViews(db, function(err, views) {
									if (err) {
										console.log('err views')
									} else {
										console.log('views success');
										window.config = {
											db: db,
											s: coax(url),
											views : views
										};
										return config;
									}
								});
							}
						};
						setupDb(db, setUpDbCb);
					}
				});
			} else {
				console.log('cblite not intilized');
			}
            
            //Insert recived sms into db
            function insertTranData(smsData) {
                if(smsReader){
                    var smsData = {                        
                        //sender : smsData.address,
                        //msg: smsData.body
                        sender: 'AM-ICICIB',
                        msg: 'Dear Customer, You have made a Debit Card purchase of INR300.00 on 15 Jul. Info.VPS*MADHUS SERV. Your Net Available Balance is INR XXXXX.'
                    }
                  smsReader.parse(smsData, function(transactionData) {
                      debugger;
                            transactionData.trackType = 'expense';
                            config.db.post(transactionData, function(err, ok) {
                                console.log('inserted success fully > ', arguments);
                             });
                  }, function(e) {
                        console.log("error while parse ", e);
                  });
                } else {
                    console.log("smsReader not intilized ");
                }
            }

            if (smsrec) {
                console.log('sms Plugin intilized');
                smsrec.startReception(function(data) { insertTranData(data) }, function(err) { console.log(err)});
            } else {
                console.log('sms Plugin not intilized');
            }
            
		});
	})
	.config(function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('app', {
				url: '/app',
				abstract: true,
				templateUrl: 'js/app.html'
			})
			.state('app.expenses', {
				url: '/expenses',
				views: {
					'tab-expenses': {
						templateUrl: 'js/app/expenses/expenses.html',
						controller: 'expensesCtrl'
					}
				}
			})
			.state('app.income', {
				url: '/income',
				views: {
					'tab-income': {
						templateUrl: 'js/app/income/income.html',
						controller: 'incomeCtrl'
					}
				}
			})
			.state('app.dev', {
				url: '/dev',
				views: {
					'tab-dev': {
						templateUrl: 'js/app/dev/dev.html',
						controller: 'devCtrl'
					}
				}
			})
            .state('app.sms', {
				url: '/sms',
				views: {
					'tab-dev': {
						templateUrl: 'js/app/sms/sms.html',
						controller: 'smsCtrl'
					}
				}
			});
		$urlRouterProvider.otherwise('/app/expenses');
	})