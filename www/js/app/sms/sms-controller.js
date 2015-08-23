'use strict';
angular.module('smsController', [])
    .controller('smsCtrl', ['$scope', '$log', '$timeout', '$ionicPopup', 'apiServices', smsCtrlFn]);

function smsCtrlFn($scope, $log, $timeout, $ionicPopup, apiServices) {
    $log.log('smsCtrl called!');
	
	$scope.smsList=[];
	$scope.NoOfsmss=0;
	$scope.smss ='suport';
    $scope.smsArrived='';
	$scope.columns= apiServices.getColumns();
    var successCallbackReception = function (data) {
		//$log.log('pIndex', pIndex, '; cIndex', cIndex);
		//$log.log('selected sms : ', $scope.vm[pIndex].smsList[cIndex].sms);
		$ionicPopup.alert({
			title: data.address,
			template: data.body
		}).then(function (res) {
			//alert('Popup closed!');
		});
		
		//call couch db functions to store the SMS
		$scope.smsData = {
			sender: 'AM-ICICIB',
			msg: data.body
            //msg: 'Dear Customer, You have made a Debit Card purchase of INR300.00 on 15 Jul. Info.VPS*MADHUS SERV. Your Net Available Balance is INR XXXXX.'
		};
		smsReader.parse($scope.smsData, function(transactionData) {
			$log.log("after parse Sms", transactionData);
			$scope.transactionData = transactionData;
			$scope.transactionData.trackType = 'expense';
			config.db.post($scope.transactionData, function(err, ok) {
				$log.log("inserted successfully");
				$log.log('err: ', err);
				$log.log('ok: ', ok);
			});
		}, function(e) {
			$log.log("error while parse ", e);
			$scope.transactionData = {};
			$scope.error = e;
		});


		$scope.doParse = function() {
			$log.log('Doing  parsing', $scope.smsData);

			var doc = { desc : "test", amount : 1000 };
			doc.type = "expense"
			config.db.post(doc, function(err, ok) {
				$log.log("inserted successfully");
			});

		};
	};
	var successCallbackGetSms = function(data){
		$scope.smsList=[];
		if(Array.isArray(data)){
			for (var i = 0; i < data.length; i++) {
				$scope.smsList.push(data[i])
			}
    	}
		smsrec.startReception(successCallbackReception, failureCallback);
	};
	
	var successCallbackSmsCount = function(data){
		$scope.NoOfsmss = data;
		smsrec.getAllSms(data,successCallbackGetSms, failureCallback);
	};
	var successCallbackSupport = function(data){
		$scope.smss  = data;
		smsrec.getAllSmsCount(successCallbackSmsCount, failureCallback);
	};
	var failureCallback = function(err) {
        var alertPopup = $ionicPopup.alert({
            title: 'Support Failed!',
            template: err
          });
     };
	
	$scope.readSms = function() {
		smsrec.isSupported(successCallbackSupport, failureCallback);
		
	};
}