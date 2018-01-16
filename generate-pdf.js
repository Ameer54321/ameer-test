/**
 * @author Rodney on 2018/01/09.
 */
'use strict';
const fs  = require('fs');
const pdf = require('html-pdf');

/**
 * Generate Quote in a PDF format
 * @param customer
 * @param manger
 * @param company
 * @param rep
 * @param quote
 * @param callback
 */
exports.generateQuotePdf = function(customer, manager, company, rep, quote, callback) {
    var html = fs.readFileSync('./templates/quote.html', 'utf8');
	var options = { format: 'Letter' };
	var templateHtml = html;
	var productRowHtml = '';

	// build product items html
    for (var j=0; j<quote.products.length; j++) {
    	productRowHtml += '<tr><td valign="top">'+quote.products[j].sku+'</td>';
	    productRowHtml += '<td valign="top">'+quote.products[j].name+'</td>';
	   	productRowHtml += '<td valign="top" class="center">'+quote.products[j].qty+'</td>';
	    productRowHtml += '<td valign="top" class="right">R '+quote.products[j].unit_price+'</td>';
	    productRowHtml += '<td valign="top" class="right">R '+quote.products[j].total_price+'</td>';
	    productRowHtml += '</tr>';
    }

	var data = [
		{name: '{{REP_NAME}}', content: rep.name},
		{name: '{{COMP_TO_NAME}}', content: customer.name},
		{name: '{{COMP_TO_ADDR_1}}', content: customer.address.line1},
		{name: '{{COMP_TO_ADDR_2}}', content: customer.address.line2},
		{name: '{{COMP_TO_CITY}}', content: customer.address.city},
		{name: '{{COMP_TO_COUNTRY}}', content: customer.address.country},
		{name: '{{COMP_TO_POSTCODE}}', content: customer.address.postcode},
		{name: '{{COMP_FROM_NAME}}', content: company.name},
		{name: '{{COMP_FROM_ADDR_1}}', content: company.address.line1},
		{name: '{{COMP_FROM_ADDR_2}}', content: company.address.line2},
		{name: '{{COMP_FROM_CITY}}', content: company.address.city},
		{name: '{{COMP_FROM_COUNTRY}}', content: company.address.country},
		{name: '{{COMP_FROM_POSTCODE}}', content: company.address.postcode},
		{name: '{{QUOTE_DATE}}', content: quote.date},
		{name: '{{QUOTE_NUMBER}}', content: quote.number},
		{name: '{{QUOTE_TOTAL_EXCL_VAT}}', content: quote.total_excl_vat},
		{name: '{{QUOTE_TOTAL_INCL_VAT}}', content: quote.total},
		{name: '{{QUOTE_VAT}}', content: quote.vat},
		{name: '{{PRODUCT_ITEMS}}', content: productRowHtml},
		{name: '{{QUOTE_TOTAL}}', content: quote.total}
	];

	// dynamically replace template variables/placeholders
	for (var i=0; i<data.length; i++) {
		templateHtml = templateHtml.replace(data[i].name, data[i].content);
	}
	 
	pdf.create(templateHtml, options).toFile('./quote.pdf', function(err, res) {
	  	callback(err, res);
	});
};