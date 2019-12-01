/******* ProductWindow ********************************************************
 * Окно товара.
 ******************************************************************************/

Ext.define('BasketCost.ProductWindow',
 {
  extend: 'Ext.window.Window',

// Действие
//  add  - добавить,
//  edit - редактировать:
  action: undefined,

// Поля редактируемой записи:
  values: undefined,

// Callback "Сохранить":
  callback: undefined,
  scope: undefined,
  cbData: undefined,

  width: 400,

  resizable: false,

  layout:
   {
    type: 'vbox',
    align: 'stretch'
   },

  items:
   [
// Форма:
    {
     xtype: 'form',
     border: false,
     bodyPadding: 5,
     flex: 1,

     defaults:
      {
       labelAlign: 'right'
      },

     items:
      [
       {
        xtype: 'textfield',
        name: 'name',
        fieldLabel: 'Название',
        allowBlank: false,
        width: '100%'
       },
       {
        xtype: 'numberfield',
        name: 'quantity',
        fieldLabel: 'Количество',
        allowDecimals: false,
        minValue: 1,
        allowBlank: false,
        width: 200
       },
       {
        xtype: 'numberfield',
        name: 'price',
        fieldLabel: 'Цена',
        decimalPrecision: 2,
        minValue: 0,
        allowBlank: false,
        width: 200,

        validator: function(val)
                    {
                     if (val == '0')
                      return ('Цена должна быть больше нуля.');

                     return (true);
                    }
       },
       {
        xtype: 'combobox',
        name: 'currency',
        fieldLabel: 'Валюта',
        displayField: 'currency',
        queryMode: 'local',
        forceSelection: true,
        allowBlank: false,

        store:
         {
          data: BasketCost.currencyList.map((item) => ({ currency: item }))
         },

        width: 200
       }
      ]
    },

// Кнопки:
    {
     xtype: 'container',
     padding: 5,

     layout:
      {
       type: 'hbox',
       pack: 'end'
      },

     items:
      [
       {
        xtype: 'button',
        itemId: 'btnSave',
        text: 'Сохранить',
        width: 100
       },
       {
        xtype: 'button',
        itemId: 'btnCancel',
        text: 'Отмена',
        width: 100,
        margin: '0 0 0 10'
       }
      ]
    }
   ],

// Форма:
  _form: undefined,

/******* initComponent ********************************************************
 * Инициализация заголовка, переменных, обработчиков событий.
 ******************************************************************************/
  initComponent: function()
   {
    let btn;

    this.callParent(arguments);

    this._form = this.down('form');

    btn = this.down('#btnSave');
    btn.handler = this._onClick_save;
    btn.scope = this;

    btn = this.down('#btnCancel');
    btn.handler = this._onClick_cancel;
    btn.scope = this;

    if (this.action == 'add')
     this.setTitle('Новый товар');
    else  // 'edit'
     {
      this.setTitle(Ext.String.format('Товар "{0}"', this.values && this.values.name || ""));
      this._form.getForm().setValues(this.values);
     }
   },

/******* _onClick_save ********************************************************
 * Кнопка "Сохранить".
 ******************************************************************************/
  _onClick_save: function()
   {
// Контроль правильности заполнения формы:
    if (!this._form.isValid())
     {
      Ext.Msg.show({
                    title:'Ошибка',
                    message: 'Неверные данные',
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.ERROR,
                   });

      return;
     }

// Вызов callback:
    if (this.callback)
     this.callback.call(this.scope || window,
                        this._form.getForm().getFieldValues(),
                        this.cbData);

    this.close();
   },

/******* _onClick_cancel ******************************************************
 * Кнопка "Отмена".
 ******************************************************************************/
  _onClick_cancel: function()
   {
    this.close();
   }
 });
