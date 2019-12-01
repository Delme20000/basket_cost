/******* basket_cost **********************************************************
 * Расчет стоимости корзины товаров в разных валютах.
 * Клиент.
 *
 * ExtJs 6.2.0
 ******************************************************************************/

Ext.Loader.setPath('BasketCost', 'src');

BasketCost =
 {
// Список валют по умолчанию:
  currencyList: [ 'RUB' ]
 };

/******* BasketCostApp ********************************************************
 * Приложение.
 ******************************************************************************/
Ext.application(
 {
  name: 'BasketCostApp',

  mainView: 'Ext.container.Viewport',

/******* launch ***************************************************************
 * Основная функция.
 ******************************************************************************/
  launch: function()
   {
    var mainView = this.getMainView();

    mainView.setLoading(true);

// Запрос списка валют:
    Ext.Ajax.request({
                      url: '/get_currency_list',

                      callback: function(opts, success, response)
                                 {
                                  try
                                   {
                                    BasketCost.currencyList = JSON.parse(response.responseText);
                                   }
                                  catch (e)
                                   {}

// Окно корзины:
                                  Ext.create('BasketCost.BasketWindow').show();
                                  mainView.setLoading(false);
                                 },

                      scope: this
                     });
   }
 });
