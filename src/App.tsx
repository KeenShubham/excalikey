import React, { useState } from "react";

import {
  trash,
  triangle,
  square,
  fill as fillIcon,
  pointer,
} from "./components/icons";

import Button from "./components/Button";

import IconTray, { IconButton } from "./components/IconTray";
import ColorPicker from "./components/ColorPicker";
import { useAppDispatch, useAppSelector } from "./state";
import { draw, saveDrawing, select } from "./state/reducer";
import RoughCanvas from "./RoughCanvas";
import checkPointInShape from "./check-inclusion";

type ShapeTypes = "rectangle" | "circle" | "triangle";
type Point = [number, number];

function App(): JSX.Element {
  const { drawing, shapes, selected } = useAppSelector((state) => state);
  const dispatch = useAppDispatch();
  const [actionType, setActionType] = useState<ShapeTypes | "pointer" | null>();
  const [counter, setCounter] = useState(0);
  const [fill, setFill] = useState<string>("black");
  const [stroke, setStroke] = useState<string>("black");
  const [start, setStart] = useState<Point>([0, 0]);
  const [end, setEnd] = useState<Point>([0, 0]);

  let canvasShapes = Object.keys(shapes).map((id) => shapes[id]);
  if (drawing) canvasShapes.push(drawing);
  if (selected) canvasShapes.push(selected);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (actionType === "pointer") {
      const found = canvasShapes.find((shape) =>
        checkPointInShape(
          { type: "polygon", points: shape.points.map((p) => [p[0], -p[1]]) },
          [e.clientX, -e.clientY]
        )
      );
      dispatch(select(found ? found.id : null));
    } else if (actionType === "rectangle") {
      dispatch(
        draw({
          type: "rectangle",
          id: `shape-${counter}`,
          points: generatePoints("rectangle", start, end),
        })
      );
    } else if (actionType === "triangle") {
      dispatch(
        draw({
          type: "triangle",
          id: `shape-${counter}`,
          points: generatePoints("triangle", start, end),
        })
      );
    }
    setStart([e.clientX, e.clientY]);
    setEnd([e.clientX, e.clientY]);
  };
  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (drawing) {
      if (actionType === "rectangle") {
        dispatch(
          draw({ ...drawing, points: generatePoints("rectangle", start, end) })
        );
      } else if (actionType === "triangle") {
        dispatch(
          draw({ ...drawing, points: generatePoints("triangle", start, end) })
        );
      }
      setEnd([e.clientX, e.clientY]);
    }
  };
  const handleMouseUp = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (drawing) {
      dispatch(saveDrawing());
    }
    setStart([0, 0]);
    setEnd([0, 0]);
    setCounter(counter + 1);
  };

  return (
    <div>
      <IconTray style={{ position: "fixed" }}>
        <Button onClick={() => console.log("clear everything")} active={false}>
          {trash}
        </Button>
        <ColorPicker
          style={{ padding: "7px", margin: "0.125rem" }}
          value={fill}
          onChange={(val) => setFill(val)}
          icon={fillIcon}
        />
        <ColorPicker
          style={{ padding: "7px", margin: "0.125rem" }}
          value={stroke}
          onChange={(val) => setStroke(val)}
          icon={square}
        />
      </IconTray>
      <IconTray style={{ position: "fixed", marginLeft: "45vw" }}>
        <IconButton
          selected={actionType === "pointer"}
          onClick={() => setActionType("pointer")}
          style={{ padding: "7px", margin: "0.125rem" }}
        >
          {pointer}
        </IconButton>
        <IconButton
          selected={actionType === "rectangle"}
          onClick={() => setActionType("rectangle")}
          style={{ padding: "7px", margin: "0.125rem" }}
        >
          {square}
        </IconButton>
        <IconButton
          selected={actionType === "triangle"}
          onClick={() => setActionType("triangle")}
          style={{ padding: "7px", margin: "0.125rem" }}
        >
          {triangle}
        </IconButton>
      </IconTray>
      <RoughCanvas
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}

function generatePoints(type: ShapeTypes, start: Point, end: Point): Point[] {
  if (type === "rectangle") {
    return [start, [end[0], start[1]], end, [start[0], end[1]]];
  } else if (type === "triangle") {
    return [start, [end[0], start[1]], [(start[0] + end[0]) / 2, end[1]]];
  } else if (type === "circle") {
    return [start];
  } else {
    return [];
  }
}

export default App;
