/******* BasketGrid ***********************************************************
 * Таблица продуктов.
 ******************************************************************************/

Ext.define('BasketCost.BasketGrid',
 {
  extend: 'Ext.grid.Panel',

  xtype: 'basket_grid',

  columns:
   [
    {
     text: 'Название',
     dataIndex: 'name',
     flex: 1
    },
    {
     xtype: 'numbercolumn',
     text: 'Количество',
     dataIndex: 'quantity',
     format: '0,000',
     align: 'right'
    },
    {
     xtype: 'numbercolumn',
     text: 'Цена',
     dataIndex: 'price',
     align: 'right'
    },
    {
     text: 'Валюта',
     dataIndex: 'currency'
    }
   ],

  store:
   {
    fields: [ 'name', 'quantity', 'currency', 'price' ]
   },

// Не показывать маркеры измененных ячеек:
  viewConfig:
   {
    markDirty: false
   }
 });
