var MultiSelect = function(node, list, options){
    // Privates
    var model = [];             // This is essentially a straight copy of the list
    var filteredModel = [];     // This contains the list items, but also the index it maps to in the original model. E.g. [{index: 2, item: 'An item'}, {index: 3, item: {name: 'A name', value: 'value pair'}}]
    var selectedIndices = [];
    var instance = this;
    // Utilities
    function forEach(list, callback){
        function isNodeList(nodes) {
            var stringRepr = Object.prototype.toString.call(nodes);

            return typeof nodes === 'object' &&
                /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr);
        }

        if(Object.prototype.toString.call(list) === '[object Array]'){
            for(var i = 0; !!list && i < list.length; i++){
                callback(list[i], i);
            }
        }
        else if(typeof list == 'object'){
            var isNodeList = isNodeList(list);

            for(var i in list){
                if(!isNodeList || (isNodeList && i != 'length' && i != 'item')){
                    callback(list[i], i);
                }
            }
        }
    }
    // Start - Model related functions
    function createModel(){
        model = list;
    }
    function createFilteredModel(filter){
        filteredModel = [];

        for(var i = 0; !!model && i < model.length; i++){
            var item = model[i];
            var value = (typeof item === 'string') ? item : item.name;
            if(!filter || value.toLowerCase().indexOf(filter.toLowerCase()) != -1){    // Then we want it in our filtered list
                filteredModel[filteredModel.length] = {index: i, item: item};
            }
        }
    }
    function filterModel(filter){
        createFilteredModel(filter);    // Create the new filetered model
        removeCheckboxHandlers();       // Remove existing event handlers on checkboxes
        createListElements();           // Then re-create the html list
        createCheckboxHandlers();       // Create new event handlers on checkboxes

        return filteredModel;
    }
    function getFlattenedModel(){
        var flattenedModel = {};
        forEach(model, function forEachModelItem(item, propertyName){
            if(typeof item === 'object'){
                if(!!item.value){
                    flattenedModel[propertyName] = item.value;
                }
            }
            else if(typeof item === 'string'){
                flattenedModel[propertyName] = item;
            }
        });

        return flattenedModel;
    }
    function getFlattenedSelectedModel(){
        // Build selected model from selected indices;
        var selectedModel = [];
        selectedIndices.sort(function compareNumbers(a, b) {
            return a - b;
        });
        var flattenedModel = getFlattenedModel();
        for(var i = 0; !!selectedIndices && i < selectedIndices.length; i++){
            selectedModel[selectedModel.length] = flattenedModel[selectedIndices[i]];
        }

        return selectedModel;
    }
    function getModel(){
        return model;
    }
    function setModel(deltaModel){
        model = deltaModel;
        createFilteredModel();
        createListElements();           // Then re-create the html list
        createCheckboxHandlers();       // Create new event handlers on checkboxes
    }
    function getSelectedModel(){
        // Build selected model from selected indices;
        var selectedModel = [];
        selectedIndices.sort(function compareNumbers(a, b) {
            return a - b;
        });
        for(var i = 0; !!selectedIndices && i < selectedIndices.length; i++){
            selectedModel[selectedModel.length] = model[selectedIndices[i]];
        }

        return selectedModel;
    }
    function setSelectedModel(deltaSelectedModel){
        // Clear current selections
        var checkboxes = node.querySelectorAll('.multiSelect input');
        forEach(checkboxes, function forEachCheckbox(checkbox){
            checkbox.checked = false;
        });
        // Clear selected indices
        selectedIndices = [];

        // Make new selection
        forEach(deltaSelectedModel, function forEachModelItem(value){
            forEach(checkboxes, function forEachCheckbox(checkbox, index){
                if(checkbox.value == value){
                    checkbox.checked = true;
                    selectedIndices[selectedIndices.length] = index;

                    // Set selected input field
                    var input = node.querySelector('.selectedDisplay');
                    input.value += (!!input.value ? (',' + value) : value);
                }
            });
        });

        // Update the selected display
        updateInputWithSelected();
    }
    // End - Model related functions
    // Start - View related functions
    function createElements(){
        if(!node){
            console.error('No node found, cannot create widget.')
            return;
        }
        if(!model){
            console.error('No model created yet (i.e. model variable is null). A model is required for the list to be created.');
            return;
        }

        // Create the elements
        var id = (!!options && options.id) || '';
        var label = (!!options && options.label) || '';
        var html = '';
        if(node.parentNode.className.indexOf('control') == -1 || node.parentNode.parentNode.className.indexOf('multi_select_wrapper') == -1){
            html += '<div class="multi_select_wrapper wrapper ' + id + '"><span class="label">' + label + '</span><div class="control">';
            node = node.parentNode;
        }

        html += '<div class="downArrow"></div><input class="selectedDisplay" type="text" readonly/></div>';
        html += '<div class="multiSelectContextMenu hidden"><div class="filterBlock"><span class="filterLabel">filter:</span><input class="filterInput" type="text"/></div>'
        html += '<ul class="multiSelect">';

        html += '</ul>';
        if(node.parentNode.className.indexOf('control') == -1 || node.parentNode.parentNode.className.indexOf('multi_select_wrapper') == -1){
            html += '</div></div>';
        }
        node.innerHTML = html;

        // Create the list items
        createListElements();
    }
    function createListElements(){
        function createListItemHTML(display, value, index){
            var isChecked = (selectedIndices.indexOf(index) != -1)

            return '<li><label><input data-index="' + index + '" type="checkbox" value="' + value + '" ' + (isChecked ? 'checked' : '') + '/><span class="optionText">' + display + '</span></label></li>';
        }
        var listHtml = '';
        for(var i = 0; !!filteredModel && i < filteredModel.length; i++){
            // Use the filteredModel, even when not filtered, as filteredModel will be populated by model in this case
            var item = filteredModel[i].item;
            var name = (typeof item === 'string') ? item : item.name;
            var value = (typeof item === 'string') ? item : item.value;
            listHtml += createListItemHTML(name, value, filteredModel[i].index);
        }
        var unorderedList = node.querySelector('ul');
        unorderedList.innerHTML = listHtml;
    }
    // End - View related functions
    // Start - Event handlers
    function addToSelectedIndices(index){
        if(isNaN(index)){
            console.error('Cannot add index: ' + index + ' to selectedIndices. It needs to be a number.')
            return;
        }
        selectedIndices.push(index);
    }
    function removeFromSelectedIndices(index){
        if(isNaN(index)){
            console.error('Cannot remove index: ' + index + ' to selectedIndices. It needs to be a number.')
            return;
        }
        var indexOfItem = selectedIndices.indexOf(index);
        selectedIndices.splice(indexOfItem, 1);
    }
    function updateInputWithSelected(){
        var input = node.querySelector('input.selectedDisplay');
        var selectedText = '';
        var selectedList = getSelectedModel();

        for(var i = 0; !!selectedList && i < selectedList.length; i++){
            if(!!selectedText){
                selectedText += ', ';
            }
            selectedText += (typeof selectedList[i] === 'string' ? selectedList[i] : selectedList[i].name);
        }

        input.value = selectedText;
    }
    function onCheckboxChange(){
        if(this.checked){
            addToSelectedIndices(Number(this.getAttribute('data-index')));
        }
        else{
            removeFromSelectedIndices(Number(this.getAttribute('data-index')));
        }
        updateInputWithSelected();

        // Fire callback for checkbox change if provided in options
        !!options && !!options.onCheckboxChange && options.onCheckboxChange.bind(instance)();
    }
    function createFilterEventHandler(){
        var filterInput = node.querySelector('.filterInput');
        filterInput.addEventListener('keyup', function onKeyUp(event){
            filterModel(this.value);
        });
    }
    function createCheckboxHandlers(){
        var checkboxes = node.querySelectorAll('input[type=checkbox]');

        for(var i = 0; !!checkboxes && i < checkboxes.length; i++){
            checkboxes[i].addEventListener('change', onCheckboxChange);
        }
    }
    function removeCheckboxHandlers(){
        var checkboxes = node.querySelectorAll('input[type=checkbox]');

        for(var i = 0; !!checkboxes && i < checkboxes.length; i++){
            checkboxes[i].removeEventListener('change', onCheckboxChange);
        }
    }
    function createHandlers(){
        if(!node){
            console.error('No node found, cannot create widget.')
            return;
        }
        createCheckboxHandlers();

        // Code for toggling menu
        function isMenuClicked(clickedElement){
            var menu = node.querySelector('div.multiSelectContextMenu');
            var listItems = menu.querySelectorAll('*');
            for(var i = 0; !!listItems && i < listItems.length; i++){
                if(clickedElement == listItems[i]){
                    return true;
                }
            }

            return false;
        }
        window.addEventListener('click', function onClick(e){
            var inputText = node.querySelector('input.selectedDisplay');
            var downArrow = node.querySelector('div.downArrow');
            if(!isMenuClicked(e.target) && e.target != inputText && e.target != downArrow) {	// If clicked outside
                toggleMenu('hide');
            }
            else if(e.target == inputText || e.target == downArrow){	// If inputText clicked, show
                toggleMenu();	// Just toggle it: if hidden, then show, vice versa.  
            }
        });

        // Create handler for filter input
        createFilterEventHandler();
    }


    function toggleMenu(toggle){
        var contextMenu = node.querySelector('.multiSelectContextMenu');
        if(!contextMenu){
            console.error('Cannot toggle a non-existent dropdown menu. Please make sure it is created.');
            return;
        }
        function onMenuHide(){
            // Fire callback for checkbox change if provided in options
            !!options && !!options.onMenuHide && options.onMenuHide.bind(instance)();
        }
        function onMenuShow(){
            // Fire callback for checkbox change if provided in options
            !!options && !!options.onMenuShow && options.onMenuShow.bind(instance)();
        }
        function onMenuToggle(){
            // Fire callback for checkbox change if provided in options
            !!options && !!options.onMenuToggle && options.onMenuToggle.bind(instance)();
        }
        if(!toggle){
            if(/hidden/g.test(contextMenu.className)){
                contextMenu.className = contextMenu.className.replace(/\shidden/g, '');
                onMenuShow();
            }
            else if(!/hidden/g.test(contextMenu.className)){
                contextMenu.className += ' hidden';
                onMenuHide();
            }
        }
        else{
            if(toggle === 'hide' && !/hidden/g.test(contextMenu.className)){
                contextMenu.className += ' hidden';
                onMenuHide();
            }
            else if(toggle === 'show'){
                contextMenu.className = contextMenu.className.replace(/\shidden/g, '');
                onMenuShow();
            }
        }
        onMenuToggle();
    }
    // End - Event handlers

    // Code to run things
    createModel();
    createFilteredModel();
    createElements();
    createHandlers();
    // Public functions
    this.id = (!!options && options.id);
    this.label = (!!options && options.label);
    this.toggleMenu = toggleMenu;
    this.getModel = getModel;
    this.getFlattenedModel = getFlattenedModel;
    this.setModel = setModel;
    this.filterModel = filterModel;
    this.getSelectedModel = getSelectedModel;
    this.getFlattenedSelectedModel = getFlattenedSelectedModel;
    this.setSelectedModel = setSelectedModel;
    this.setOnCheckboxChange = function(callback){
        options.onCheckboxChange = callback;
    }
    this.setOnMenuShow = function(callback){
        options.onMenuShow = callback;
    }
    this.setOnMenuHide = function(callback){
        options.onMenuHide = callback;
    }
    this.setOnMenuToggle = function(callback){
        options.onMenuToggle = callback;
    }
};
