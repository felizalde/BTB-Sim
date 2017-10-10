define(["./libs/sigma/sigma"], function (sigma) {
    sigma = sigma || window.sigma;

    function Graph() { }

    var data = {
        nodes: [],
        edges: []
    };

    Graph.prototype.addNode = function (nodeId, i, nodesNum) {
        var node = {
            "id": nodeId,
            "label": nodeId,
            "size": 5,
            "x": Math.cos(Math.PI * 2 * i / nodesNum),
            "y": Math.sin(Math.PI * 2 * i / nodesNum),
            "color" : "#11BFAE"
        };

        data["nodes"].push(node);
    }

    Graph.prototype.addEdge = function (from, to) {
        var edge = {
            "id": from + to,
            "size" : 5,
            "source": from,
            "target": to,
            "type" : "arrow",
            "color" : "#11BFAE"
        };

        data["edges"].push(edge);
    }

    Graph.prototype.draw = function ($) {
        $('#sg').html('<div id="sigma-container"></div>');
        new sigma({
            graph: data,
            container: 'sigma-container',
            settings: {
                minEdgeSize: 5,
                maxEdgeSize: 5,
            }
        }).refresh();

        data["nodes"]=[];
        data["edges"]=[];
    }

    return Graph;
});
