/******* BasketWindow *********************************************************
 * Окно корзины.
 ******************************************************************************/

Ext.define('BasketCost.BasketWindow',
 {
  extend: 'Ext.window.Window',

  requires:
   [
    'BasketCost.BasketGrid'
   ],

  title: 'Корзина',

  width: 600,
  height: 400,

  maximizable: true,
  closable: false,

  layout: 'fit',

// Панель инструментов с кнопками:
  tbar: [
         {
          xtype: 'button',
          itemId: 'btnAdd',
          text: 'Добавить',
          icon: '/img/add14.png'
         },
         {
          xtype: 'button',
          itemId: 'btnEdit',
          text: 'Редактировать',
          icon: '/img/edit14.png',
          disabled: true
         },
         {
          xtype: 'button',
          itemId: 'btnDel',
          text: 'Удалить',
          icon: '/img/del14.png',
          disabled: true
         },
         '-',
         {
          xtype: 'button',
          itemId: 'btnCount',
          text: 'Посчитать',
          icon: '/img/calc14.png'
         }
        ],

// Таблица товаров:
  items: [
          {
           xtype: 'basket_grid',
           border: false
          }
         ],

// Кнопки:
  _btnAdd: undefined,
  _btnEdit: undefined,
  _btnDel: undefined,
  _btnCount: undefined,

// Таблица:
  _grid: undefined,

/******* initComponent ********************************************************
 * Инициализация переменных, обработчиков событий.
 ******************************************************************************/
  initComponent: function()
   {
    this.callParent(arguments);

    this._btnAdd = this.down('#btnAdd');
    this._btnAdd.handler = this._onClick_add;
    this._btnAdd.scope = this;

    this._btnEdit = this.down('#btnEdit');
    this._btnEdit.handler = this._onClick_edit;
    this._btnEdit.scope = this;

    this._btnDel = this.down('#btnDel');
    this._btnDel.handler = this._onClick_del;
    this._btnDel.scope = this;

    this._btnCount = this.down('#btnCount');
    this._btnCount.handler = this._onClick_count;
    this._btnCount.scope = this;

    this._grid = this.down('grid');
    this._grid.addListener({
                            selectionchange: this._onSelChange,
                            itemdblclick: this._onItemDblClick,
                            scope: this
                           });

// Тестовый товар:
    this._grid.getStore().add({
                               name: 'PowerWatch 2',
                               quantity: 1,
                               currency: 'USD',
                               price: 499
                              });
   },

/******* _onSelChange *********************************************************
 * Изменение выделенных в таблице товаров.
 ******************************************************************************/
  _onSelChange: function(grid, records)
   {
// Доступность кнопок:
    this._setBtnState(records);
   },

/******* _onItemDblClick ******************************************************
 * Двойной клик на товаре.
 ******************************************************************************/
  _onItemDblClick: function(grid, record)
   {
// Открытие редактора:
    this._openEditor(record);
// Доступность кнопок:
    this._setBtnState([record]);
   },

/******* _setBtnState *********************************************************
 * Доступность кнопок панели инструментов.
 ******************************************************************************/
  _setBtnState: function(records)
   {
    if (!records)
     records = this._grid.getSelection();

// Выделена одна запись, и она не открыта на редактирование:
    let canChg = (records.length == 1 && !records[0]._isEdited);

    this._btnEdit.setDisabled(!canChg);
    this._btnDel.setDisabled(!canChg);
   },

/******* _onClick_add *********************************************************
 * Кнопкс "Добавить".
 ******************************************************************************/
  _onClick_add: function()
   {
// Окно создания:
    Ext.create('BasketCost.ProductWindow',
               {
                action: 'add',
                callback: this._onAdd,
                scope: this
               }).show();
   },

/******* _onAdd ***************************************************************
 * Callback окна создания.
 ******************************************************************************/
  _onAdd: function(vals)
   {
// Новая запись в таблице:
    this._grid.getStore().add(vals);
   },

/******* _onClick_edit ********************************************************
 * Кнопка "Редактировать".
 ******************************************************************************/
  _onClick_edit: function()
   {
    let records = this._grid.getSelection();

    if (records.length == 1)
     {
      this._openEditor(records[0]);
      this._setBtnState(records);
     }
   },

/******* _openEditor **********************************************************
 * Открытие окна редактирования.
 ******************************************************************************/
  _openEditor: function(record)
   {
    if (!record._isEdited)
     {
// Запись открыта на редактирование:
      record._isEdited = true;

// Окно редактирования:
      Ext.create('BasketCost.ProductWindow',
                 {
                  action: 'edit',
                  values: record.getData(),
                  callback: this._onEdit,
                  scope: this,

                  cbData:
                   {
                    record: record
                   },

                  listeners:
                   {
                    destroy: this._onEditorDestroy,
                    scope: this
                   }
                 }).show();
     }
   },

/******* _onEdit **************************************************************
 * Callback окна редактирования.
 ******************************************************************************/
  _onEdit: function(vals, data)
   {
// Обновление данных в таблице:
    data.record.set(vals);
   },

/******* _onEditorDestroy *****************************************************
 * Закрытие окна редактирования.
 ******************************************************************************/
  _onEditorDestroy: function(win)
   {
// Снимаем флаг редактирования с записи:
    delete win.cbData.record._isEdited;
    this._setBtnState();
   },

/******* _onClick_del *********************************************************
 * Кнопка "Удалить".
 ******************************************************************************/
  _onClick_del: function()
   {
    let records = this._grid.getSelection();

// Удаляем товар после подтверждения:
    if (records.length == 1)
     Ext.Msg.show({
                   title:'Внимание',

                   message: Ext.String.format('Удалить товар "{0}"?',
                                              records[0].get('name')),

                   buttons: Ext.Msg.YESNO,
                   icon: Ext.Msg.QUESTION,

                   fn: function(btnId)
                        {
                         if (btnId == 'yes')
                          this._grid.getStore().remove(records[0]);
                        },

                   scope: this
                  });
   },

/******* _onClick_count *******************************************************
 * Кнопка "Посчитать".
 ******************************************************************************/
  _onClick_count: function()
   {
    this.setLoading(true);

// Запрос на сервер:
    Ext.Ajax.request({
                      url: '/count_basket',
                      method: 'POST',
                      jsonData: this._getBasketData(),
                      callback: this._onCountBasket,
                      scope: this
                     });
   },

/******* _getBasketData *******************************************************
 * Формирование JSON товаров в корзине.
 ******************************************************************************/
  _getBasketData: function()
   {
    let res = [];

    this._grid.getStore().each((record) => res.push(record.getData()));

    return (res);
   },

/******* _onCountBasket *******************************************************
 * Callback запроса на расчет корзины.
 * Выводим таблицу стоимостей или сообщение об ошибке.
 ******************************************************************************/
  _onCountBasket: function(opts, success, response)
   {
    if (success)
     {
      let tpl = new Ext.XTemplate('<table width="100%">',
                                   '<tpl foreach=".">',
                                    '<tr>',
                                     '<td align="right">{[ Ext.Number.toFixed(values, 2) ]}</td>',
                                     '<th>{$}</th>',
                                    '</tr>',
                                   '</tpl>',
                                  '</table>');

      Ext.Msg.show({
                    title: "Стоимость корзины",
                    message: tpl.apply(JSON.parse(response.responseText)),
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.INFO
                   });
     }
    else
     Ext.Msg.show({
                   title: "Ошибка",
                   message: "Ошибка расчета стоимости.",
                   buttons: Ext.Msg.OK,
                   icon: Ext.Msg.ERROR
                  });

    this.setLoading(false);
   }
 });
