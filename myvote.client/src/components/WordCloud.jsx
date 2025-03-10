import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const WordCloud = ({ opinions }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!opinions || opinions.length === 0) return;

        const width = 500;
        const height = 300;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .style("background", "#f8f9fa");

        svg.selectAll("*").remove();

        // Prepare data (each opinion as a single entry)
        const wordArray = opinions.map((opinion, index) => ({
            text: opinion,
            size: Math.min(40, 12 + Math.random() * 20), // Randomized size for variety
            id: index
        }));

        const colors = d3.scaleOrdinal(d3.schemeCategory10);

        const wordElements = svg
            .selectAll("text")
            .data(wordArray)
            .enter()
            .append("text")
            .style("fill", (d, i) => colors(i))
            .style("font-size", d => `${d.size}px`)
            .style("cursor", "pointer")
            .attr("text-anchor", "middle")
            .text(d => d.text)
            .on("mouseover", function () {
                d3.select(this).transition().duration(300).style("fill", "red");
            })
            .on("mouseout", function () {
                d3.select(this).transition().duration(300).style("fill", (d, i) => colors(i));
            });

        // Position opinions randomly
        wordElements
            .attr("x", () => Math.random() * width * 0.8 + width * 0.1)
            .attr("y", () => Math.random() * height * 0.8 + height * 0.1)
            .transition()
            .duration(1000)
            .attr("x", d => Math.random() * (width - d.size))
            .attr("y", d => Math.random() * (height - d.size));

    }, [opinions]);

    return <svg ref={svgRef} />;
};

export default WordCloud;
