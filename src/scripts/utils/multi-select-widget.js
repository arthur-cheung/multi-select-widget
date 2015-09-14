var MultiSelect = function(node, list, options){
    // Privates
    var model = [];             // This is essentially a straight copy of the list
    var filteredModel = [];     // This contains the list items, but also the index it maps to in the original model. E.g. [{index: 2, item: 'An item'}, {index: 3, item: {name: 'A name', value: 'value pair'}}]
    var selectedIndices = [];
    // Utilities

    // Start - Model related functions
    function createModel(){
        model = list;
    }
    function createFilteredModel(filter){
        filteredModel = [];

        for(var i = 0; !!model && i < model.length; i++){
            var item = model[i];
            var value = (typeof item === 'string') ? item : item.name;
            if(!filter || value.indexOf(filter) != -1){    // Then we want it in our filtered list
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
    function getModel(){
        return model;
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
        var html = '<div><input class="selectedDisplay" type="text" readonly/></div>';
        html += '<div class="multiSelectContextMenu hidden"><div><input class="filterInput" type="text"/></div>'
        html += '<ul class="multiSelect">';

        html += '</ul></div>';

        node.innerHTML = html;

        // Create the list items
        createListElements();
    }
    function createListElements(){
        function createListItemHTML(display, value, index){
            var isChecked = (selectedIndices.indexOf(index) != -1)

            return '<li><input data-index="' + index + '" type="checkbox" value="' + value + '" ' + (isChecked ? 'checked' : '') + '/>' + display + '</li>';
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
            if(!isMenuClicked(e.target) && e.target != inputText) {	// If clicked outside
                toggleMenu('hide');
            }
            else if(e.target == inputText){	// If inputText clicked, show
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
        if(!toggle){
            if(/hidden/g.test(contextMenu.className)){
                contextMenu.className = contextMenu.className.replace(/\shidden/g, '');
            }
            else if(!/hidden/g.test(contextMenu.className)){
                contextMenu.className += ' hidden';
            }
        }
        else{
            if(toggle === 'hide' && !/hidden/g.test(contextMenu.className)){
                contextMenu.className += ' hidden';
            }
            else if(toggle === 'show'){
                contextMenu.className = contextMenu.className.replace(/\shidden/g, '');
            }
        }

    }
    // End - Event handlers

    // Code to run things
    createModel();
    createFilteredModel();
    createElements();
    createHandlers();
    // Public functions        
    this.toggleMenu = toggleMenu;
    this.getModel = getModel;
    this.filterModel = filterModel;
    this.getSelectedModel = getSelectedModel;
};
