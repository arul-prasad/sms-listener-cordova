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
			//msg: data.body
            msg: 'Dear Customer, You have made a Debit Card purchase of INR300.00 on 15 Jul. Info.VPS*MADHUS SERV. Your Net Available Balance is INR XXXXX.'
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
	};
	var successCallbackGetSms = function(data){
		$scope.smsList=[];
		if(Array.isArray(data)){
			for (var i = 0; i < data.length; i++) {
                /*var sms = data[i];
                $log.log(" sms " , sms);
                data[i].date=new Date(data[i].date);*/
				$scope.smsList.push(data[i])
			}
    	}
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