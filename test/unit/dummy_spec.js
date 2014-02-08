
/*global inject*/
describe('Dummy unit test', function() {
  

  var $compile
  var $rootScope
 
  beforeEach(module('sign'))

  beforeEach(inject(function(_$compile_, _$rootScope_){
    $compile = _$compile_
    $rootScope = _$rootScope_
  }))

  it('Lol', function() {
    console.log('lol')
  })

})
