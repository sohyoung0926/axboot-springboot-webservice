var fnObj = {};
var ACTIONS = axboot.actionExtend(fnObj, {
    PAGE_SEARCH: function (caller, act, data) {
        axboot.ajax({
            type: "GET",
            url: ["samples", "parent"],
            data: caller.searchView.getData(),
            callback: function (res) {
                caller.gridView01.setData(res);
            }
            options: {
                // axboot.ajax 함수에 2번째 인자는 필수가 아닙니다. ajax의 옵션을 전달하고자 할때 사용합니다.
                onError: function (err) {
                    console.log(err);
                },
            },
        });
        return false;
    },
    PAGE_SAVE: function (caller, act, data) {
        var saveList = [].concat(caller.gridView01.getData('modified'));
        saveList = saveList.concat(caller.gridView01.getData('deleted'));

        axboot.ajax({
            type: 'PUT',
            url: ['samples', 'parent'],
            data: JSON.stringify(saveList),
            callback: function (res) {
                ACTIONS.dispatch(ACTIONS.PAGE_SEARCH);
                axToast.push('저장 되었습니다');
            },
        });
    },
    FORM_CLEAR: function (caller, act, data) {
        axDialog.confirm({
            msg: LANG("ax.script.form.clearconfirm")
        }, function () {
            if (this.key == "ok") {
                caller.formView01.clear();
            }
        });
    },
    ITEM_CLICK: function (caller, act, data) {},
    
    ITEM_ADD: function (caller, act, data) {
        caller.gridView01.addRow();
    },
    
    ITEM_DEL: function (caller, act, data) {
        caller.gridView01.delRow('selected');
    },
    dispatch: function (caller, act, data) {
        var result = ACTIONS.exec(caller, act, data);
        if (result != 'error') {
            return result;
        } else {
            // 직접코딩
            return false;
        }
    },
});
    
    

// fnObj 기본 함수 스타트와 리사이즈
fnObj.pageStart = function () {
    this.pageButtonView.initView();
    this.searchView.initView();
    this.gridView01.initView();

    ACTIONS.dispatch(ACTIONS.PAGE_SEARCH);
};

fnObj.pageResize = function () {};

fnObj.pageButtonView = axboot.viewExtend({
    initView: function () {
        axboot.buttonClick(this, 'data-page-btn', {
            search: function () {
                ACTIONS.dispatch(ACTIONS.PAGE_SEARCH);
            },
            save: function () {
                ACTIONS.dispatch(ACTIONS.PAGE_SAVE);
            },
            excel: function () {},
        });
    },
});
    

//== view 시작
/**
 * searchView
 */
fnObj.searchView = axboot.viewExtend(axboot.searchView, {
    initView: function () {
        this.target = $(document["searchView0"]);
        this.target.attr("onsubmit", "return ACTIONS.dispatch(ACTIONS.PAGE_SEARCH);");
        this.filter = $("#filter");
    },
    getData: function () {
        return {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            filter: this.filter.val()
        }
    }
});


/**
 * gridView
 */
fnObj.gridView01 = axboot.viewExtend(axboot.gridView, {
    initView: function () {
        var _this = this;

        this.target = axboot.gridBuilder({
            showRowSelector: true,
            frozenColumnIndex: 0,
            multipleSelect: true,
            target: $('[data-ax5grid="grid-view-01"]'),
            columns: [
                {key: "key", label: "KEY", width: 120, align: "left",  editor:"text"},
                {key: "undefined", label: "VALUE",  align: "left"
                /*{key: "display", label: "DISPLAY", width: 70, align: "center"},
                  {key: "valuearea", label: "VALUEAREA", width: 70, align: "center"}
                */
                  columns: [
                    {
                        key: 'value',
                        label: 'display',
                        width: 150,
                        align: 'left',
                    },

                    {
                        key: 'value',
                        label: 'textarea',
                        width: 150,
                        align: 'left',
                        editor: {
                            type: 'textarea',
                        },
                    },
                ],
            },
            {
                key: undefined,
                label: 'etc',
                align: 'center',
                columns: [
                    {
                        key: 'etc1',
                        label: 'money',
                        width: 100,
                        align: 'center',
                        editor: { type: 'money' },
                    },
                    {
                        key: 'etc2',
                        label: 'number',
                        width: 100,
                        align: 'center',
                        editor: { type: 'number' },
                    },
                    {
                        key: 'cost',
                        label: 'cost',
                        width: 100,
                        align: 'center',
                        formatter: function () {
                            var etc1 = this.item.etc1 || 0;
                            var etc2 = this.item.etc2 || 0;
                            return ax5.util.number(etc1 * etc2, { money: true });
                        },
                        {
                            key: 'etc3',
                            label: 'date',
                            width: 100,
                            align: 'center',
                            editor: { type: 'date' },
                        },
                    ],
                },
                {
                    key: 'etc4',
                    label: 'select',
                    width: 100,
                    align: 'center',
                    formatter: function () {
                        var i = 0,
                            len = fnObj.selectItems.length,
                            value;
                        for (; i < len; i++) {
                            if (this.item.etc4 === (value = fnObj.selectItems[i].value)) {
                                break;
                            }
                        }
                        return value === 'Y' ? '사용' : '미사용';
                    },
                    editor: {
                        type: 'select',
                        config: {
                            columnKeys: {
                                optionValue: 'value',
                                optionText: 'text',
                            },
                            options: fnObj.selectItems,
                        },
                    },
                },
                {
                    key: 'etc4',
                    label: 'checkbox',
                    width: 100,
                    align: 'center',
                    editor: { type: 'checkbox', config: { trueValue: 'Y', falseValue: 'N' } },
                },
            ],
                    
            body: {
                mergeCells: ['value'],
                onClick: function () {
                    this.self.select(this.dindex, { selectedClear: true });
                },
                grouping: {
                    by: ['value'],
                    columns: [
                        {
                            label: function () {
                                return this.groupBy.labels.join(', ') + ' SUM';
                            },
                            colspan: 3,
                            align: 'center',
                        },
                        { key: 'etc1', collector: 'avg', formatter: 'money', align: 'right' },
                        { key: 'etc2', collector: 'sum', formatter: 'money', align: 'right' },
                        {
                            key: 'cost',
                            collector: function () {
                                var value = 0;
                                this.list.forEach(function (n) {
                                    if (!n.__isGrouping) value += (n.etc1 || 0) * (n.etc2 || 0);
                                });
                                return ax5.util.number(value, { money: 1 });
                            },
                            align: 'right',
                        },
                    ],
                },
            },
            footSum: [
                [
                    { label: 'SUMMARY', colspan: 3, align: 'center' },
                    { key: 'etc1', collector: 'avg', formatter: 'money', align: 'right' },
                    { key: 'etc2', collector: 'sum', formatter: 'money', align: 'right' },
                    {
                        key: 'cost',
                        collector: function () {
                            var value = 0;
                            this.list.forEach(function (n) {
                                if (!n.__isGrouping) value += (n.etc1 || 0) * (n.etc2 || 0);
                            });
                            return ax5.util.number(value, { money: 1 });
                        },
                        align: 'right',
                    },
                ],
            ],
        });
        
        axboot.buttonClick(this, 'data-grid-view-01-btn', {
            add: function () {
                ACTIONS.dispatch(ACTIONS.ITEM_ADD);
            },
            delete: function () {
                ACTIONS.dispatch(ACTIONS.ITEM_DEL);
            },
        });
    },
                    

    getData: function (_type) {
        var list = [];
        var _list = this.target.getList(_type);

        if (_type == "modified" || _type == "deleted") {
            list = ax5.util.filter(_list, function () {
                delete this.deleted;
                return this.key;
            });
        } else {
            list = _list;
        }
        return list;
    },
    addRow: function () {
        this.target.addRow({__created__: true}, "last");
    }
});
