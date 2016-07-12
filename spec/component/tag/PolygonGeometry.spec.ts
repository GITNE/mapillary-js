/// <reference path="../../../typings/index.d.ts" />

import {IGPano} from "../../../src/API";
import {PolygonGeometry, GeometryTagError} from "../../../src/Component";
import {Transform} from "../../../src/Geo";
import {Node} from "../../../src/Graph";

describe("PolygonGeometry.ctor", () => {
    it("should be defined", () => {
        let polygonGeometry: PolygonGeometry =
            new PolygonGeometry([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]);

        expect(polygonGeometry).toBeDefined();
    });

    it("polygon should be set", () => {
        let original: number[][] = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);

        for (let i: number = 0; i < original.length; i++) {
            expect(polygonGeometry.polygon[i][0]).toBe(original[i][0]);
            expect(polygonGeometry.polygon[i][1]).toBe(original[i][1]);
        }
    });

    it("should throw if polygon has less then three positions", () => {
        expect(() => { return new PolygonGeometry([[0, 0], [0, 0]]); })
            .toThrowError(GeometryTagError);
    });

    it("should throw if first and last positions are not equivalent", () => {
        expect(() => { return new PolygonGeometry([[0, 0], [1, 0], [1, 1], [0, 1]]); })
            .toThrowError(GeometryTagError);
    });


    it("should throw if basic coord is below supported range", () => {
        expect(() => { return new PolygonGeometry([[-0.5, 0], [1, 0], [1, 1], [-0.5, 0]]); })
            .toThrowError(GeometryTagError);

        expect(() => { return new PolygonGeometry([[0, -0.5], [1, 0], [1, 1], [0, -0.5]]); })
            .toThrowError(GeometryTagError);
    });

    it("should throw if basic coord is above supported range", () => {
        expect(() => { return new PolygonGeometry([[1.5, 0], [1, 0], [1, 1], [1.5, 0]]); })
            .toThrowError(GeometryTagError);

        expect(() => { return new PolygonGeometry([[0, 1.5], [1, 0], [1, 1], [0, 1.5]]); })
            .toThrowError(GeometryTagError);
   });
});

describe("PolygonGeometry.addVertex2d", () => {
    it("should add a vertex before closing vertex", () => {
        let original: number[][] = [[0, 0], [0, 0], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);
        polygonGeometry.addVertex2d([1, 1]);

        let polygon: number[][] = polygonGeometry.polygon;

        expect(polygon.length).toBe(4);

        expect(polygon[0][0]).toBe(0);
        expect(polygon[0][1]).toBe(0);

        expect(polygon[1][0]).toBe(0);
        expect(polygon[1][1]).toBe(0);

        expect(polygon[2][0]).toBe(1);
        expect(polygon[2][1]).toBe(1);

        expect(polygon[3][0]).toBe(0);
        expect(polygon[3][1]).toBe(0);
    });

    it("should clamp added vertex to valid basic coordinates", () => {
        let original: number[][] = [[0, 0], [0, 0], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);
        polygonGeometry.addVertex2d([2, 2]);

        let polygon: number[][] = polygonGeometry.polygon;

        expect(polygon[2][0]).toBe(1);
        expect(polygon[2][1]).toBe(1);
    });

    it("should clamp negative added vertex to valid basic coordinates", () => {
        let original: number[][] = [[0, 0], [0, 0], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);
        polygonGeometry.addVertex2d([-1, -1]);

        let polygon: number[][] = polygonGeometry.polygon;

        expect(polygon[2][0]).toBe(0);
        expect(polygon[2][1]).toBe(0);
    });
});

describe("PolygonGeometry.removeVertex2d", () => {
    it("should throw if index is negative", () => {
        let original: number[][] = [[0, 0], [0, 0], [0, 0], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);

        expect(() => { polygonGeometry.removeVertex2d(-1); })
            .toThrowError(GeometryTagError);
    });

    it("should throw if index is larger than last index of array", () => {
        let original: number[][] = [[0, 0], [0, 0], [0, 0], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);

        expect(() => { polygonGeometry.removeVertex2d(4); })
            .toThrowError(GeometryTagError);
    });

    it("should throw if polygon has too few vertices", () => {
        let original: number[][] = [[0, 0], [1, 1], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);

        expect(() => { polygonGeometry.removeVertex2d(1); })
            .toThrowError(GeometryTagError);
    });

    it("should remove second vertex", () => {
        let original: number[][] = [[0, 0], [1, 1], [1, 0], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);
        polygonGeometry.removeVertex2d(2);

        let polygon: number[][] = polygonGeometry.polygon;

        expect(polygon.length).toBe(3);

        expect(polygon[0][0]).toBe(0);
        expect(polygon[0][1]).toBe(0);

        expect(polygon[1][0]).toBe(1);
        expect(polygon[1][1]).toBe(1);

        expect(polygon[2][0]).toBe(0);
        expect(polygon[2][1]).toBe(0);
    });

    it("should remove first vertex and set second as closing vertex", () => {
        let original: number[][] = [[0, 0], [1, 1], [0.5, 0.5], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);
        polygonGeometry.removeVertex2d(0);

        let polygon: number[][] = polygonGeometry.polygon;

        expect(polygon.length).toBe(3);

        expect(polygon[0][0]).toBe(1);
        expect(polygon[0][1]).toBe(1);

        expect(polygon[1][0]).toBe(0.5);
        expect(polygon[1][1]).toBe(0.5);

        expect(polygon[2][0]).toBe(1);
        expect(polygon[2][1]).toBe(1);
    });

    it("should remove last vertex and set second as closing vertex", () => {
        let original: number[][] = [[0, 0], [1, 1], [0.5, 0.5], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);
        polygonGeometry.removeVertex2d(3);

        let polygon: number[][] = polygonGeometry.polygon;

        expect(polygon.length).toBe(3);

        expect(polygon[0][0]).toBe(1);
        expect(polygon[0][1]).toBe(1);

        expect(polygon[1][0]).toBe(0.5);
        expect(polygon[1][1]).toBe(0.5);

        expect(polygon[2][0]).toBe(1);
        expect(polygon[2][1]).toBe(1);
    });
});

describe("RectGeometry.setVertex2d", () => {
    let createTransform: (pano: boolean) => Transform = (pano: boolean): Transform => {
        let gpano: IGPano = pano ?
            {
                CroppedAreaImageHeightPixels: 1,
                CroppedAreaImageWidthPixels: 1,
                CroppedAreaLeftPixels: 0,
                CroppedAreaTopPixels: 0,
                FullPanoHeightPixels: 1,
                FullPanoWidthPixels: 1,
            } :
            null;

        let node: Node = new Node(0, null, true, null, { gpano: gpano, key: "", rotation: [0, 0, 0] }, []);

        return new Transform(node, [0, 0, 0]);
    };

    it("should set the vertex with index 2", () => {
        let original: number[][] = [[0, 0], [1, 1], [1, 1], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);

        let vertex: number[] = [0.5, 0.6];
        let transform: Transform = createTransform(false);

        polygonGeometry.setVertex2d(2, vertex, transform);

        let polygon: number[][] = polygonGeometry.polygon;

        expect(polygon[2][0]).toBe(vertex[0]);
        expect(polygon[2][1]).toBe(vertex[1]);
    });

    it("should clamp the set vertex", () => {
        let original: number[][] = [[0, 0], [1, 1], [1, 1], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);

        let vertex: number[] = [2, -1];
        let transform: Transform = createTransform(false);

        polygonGeometry.setVertex2d(2, vertex, transform);

        let polygon: number[][] = polygonGeometry.polygon;

        expect(polygon[2][0]).toBe(1);
        expect(polygon[2][1]).toBe(0);
    });

    it("should set both the first and last vertex when setting index 0", () => {
        let original: number[][] = [[0, 0], [1, 1], [1, 1], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);

        let vertex: number[] = [0.5, 0.6];
        let transform: Transform = createTransform(false);

        polygonGeometry.setVertex2d(0, vertex, transform);

        let polygon: number[][] = polygonGeometry.polygon;

        expect(polygon[0][0]).toBe(vertex[0]);
        expect(polygon[0][1]).toBe(vertex[1]);

        expect(polygon[3][0]).toBe(vertex[0]);
        expect(polygon[3][1]).toBe(vertex[1]);
    });

    it("should set both the first and last vertex when setting last", () => {
        let original: number[][] = [[0, 0], [1, 1], [1, 1], [0, 0]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);

        let vertex: number[] = [0.5, 0.6];
        let transform: Transform = createTransform(false);

        polygonGeometry.setVertex2d(3, vertex, transform);

        let polygon: number[][] = polygonGeometry.polygon;

        expect(polygon[0][0]).toBe(vertex[0]);
        expect(polygon[0][1]).toBe(vertex[1]);

        expect(polygon[3][0]).toBe(vertex[0]);
        expect(polygon[3][1]).toBe(vertex[1]);
    });
});

describe("RectGeometry.setCentroid2d", () => {
    let precision: number = 1e-8;

    let createTransform: (pano: boolean) => Transform = (pano: boolean): Transform => {
        let gpano: IGPano = pano ?
            {
                CroppedAreaImageHeightPixels: 1,
                CroppedAreaImageWidthPixels: 1,
                CroppedAreaLeftPixels: 0,
                CroppedAreaTopPixels: 0,
                FullPanoHeightPixels: 1,
                FullPanoWidthPixels: 1,
            } :
            null;

        let node: Node = new Node(0, null, true, null, { gpano: gpano, key: "", rotation: [0, 0, 0] }, []);

        return new Transform(node, [0, 0, 0]);
    };

    it("should set the vertices according to the new centroid", () => {
        let original: number[][] = [[0.2, 0.2], [0.6, 0.2], [0.6, 0.4], [0.2, 0.4], [0.2, 0.2]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);

        let vertex: number[] = [0.5, 0.6];
        let transform: Transform = createTransform(false);

        polygonGeometry.setCentroid2d(vertex, transform);

        let polygon: number[][] = polygonGeometry.polygon;

        expect(polygon[0][0]).toBeCloseTo(0.3, precision);
        expect(polygon[0][1]).toBeCloseTo(0.5, precision);

        expect(polygon[1][0]).toBeCloseTo(0.7, precision);
        expect(polygon[1][1]).toBeCloseTo(0.5, precision);

        expect(polygon[2][0]).toBeCloseTo(0.7, precision);
        expect(polygon[2][1]).toBeCloseTo(0.7, precision);

        expect(polygon[3][0]).toBeCloseTo(0.3, precision);
        expect(polygon[3][1]).toBeCloseTo(0.7, precision);

        expect(polygon[4][0]).toBeCloseTo(0.3, precision);
        expect(polygon[4][1]).toBeCloseTo(0.5, precision);
    });

    it("should limit centroid translation to keep vertices within basic coordinates", () => {
        let original: number[][] = [[0.2, 0.2], [0.6, 0.2], [0.6, 0.4], [0.2, 0.4], [0.2, 0.2]];

        let polygonGeometry: PolygonGeometry = new PolygonGeometry(original);

        let vertex: number[] = [0.0, 0.0];
        let transform: Transform = createTransform(false);

        polygonGeometry.setCentroid2d(vertex, transform);

        let polygon: number[][] = polygonGeometry.polygon;

        expect(polygon[0][0]).toBeCloseTo(0.0, precision);
        expect(polygon[0][1]).toBeCloseTo(0.0, precision);

        expect(polygon[1][0]).toBeCloseTo(0.4, precision);
        expect(polygon[1][1]).toBeCloseTo(0.0, precision);

        expect(polygon[2][0]).toBeCloseTo(0.4, precision);
        expect(polygon[2][1]).toBeCloseTo(0.2, precision);

        expect(polygon[3][0]).toBeCloseTo(0.0, precision);
        expect(polygon[3][1]).toBeCloseTo(0.2, precision);

        expect(polygon[4][0]).toBeCloseTo(0.0, precision);
        expect(polygon[4][1]).toBeCloseTo(0.0, precision);
    });
});
