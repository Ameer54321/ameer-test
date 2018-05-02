'use strict';

module.exports = function() {
    var query = "";

    function Database() {};

    Database.prototype.get = function() {
        return query;
    };

    Database.prototype.set = function(sql) {
        query = sql;
        return query;
    };

    Database.prototype.select = function(select) {
        query = "SELECT "+select+" ";
    };
    Database.prototype.from = function(table) {
        query += "FROM "+table+" ";
    };
    Database.prototype.join = function(table,type='INNER ') {
        query += type+" JOIN "+table+" ";
    };
    Database.prototype.where = function(condition) {
        query += "WHERE "+condition+" ";
    };
    Database.prototype.order = function(order) {
        query += "ORDER BY "+order+" ";
    };
    Database.prototype.group = function(group) {
        query += "GROUP BY "+group+" ";
    };
    Database.prototype.limit = function(start, limit) {
        query += (limit > 0) ? "LIMIT "+start+","+limit+" " : " ";
    };
    Database.prototype.insert = function(table, columns, values) {
        query = "INSERT INTO "+table+" ("+columns+") VALUES("+values+")";
        return query;
    };
    Database.prototype.update = function(table, set, condition) {
        query = "UPDATE "+table+" SET "+set+" WHERE "+condition;
        return query;
    };
    Database.prototype.delete = function(table, condition) {
        query = "DELETE FROM "+table+" WHERE "+condition;
        return query;
    };
    Database.prototype.multidelete = function(data, from, join, condition) {
        query = "DELETE "+data+" FROM "+from+" JOIN "+join+" WHERE "+condition;
        return query;
    };

    // Used in tests
    Database.prototype.clear = function() {
        query = {};
    };
    return new Database();
};
