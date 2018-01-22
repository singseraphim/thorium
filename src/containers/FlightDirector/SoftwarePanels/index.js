import React, { Component } from "react";
import { Button } from "reactstrap";
import uuid from "uuid";
import "bootstrap/dist/css/bootstrap.css";
import "./style.css";
import { Link } from "react-router-dom";
import * as Components from "./components";
import ComponentLibrary from "./componentLibrary";
import PageComponent from "./pageComponent";
import DraggingLine from "./draggingLine";

class App extends Component {
  state = {
    edit: true,
    libraryShown: false,
    draggingCable: null,
    draggingComponent: null,
    componentLocation: { x: 0, y: 0 },
    components: [],
    connections: [],
    cables: [],
    connectingFrom: null,
    connectingLocation: { x: 0, y: 0 }
  };
  componentDidMount() {
    document.addEventListener("mousemove", this.cableMovement);
    document.addEventListener("mouseup", this.cableUp);
  }
  componentWillUnmount() {
    document.removeEventListener("mousemove", this.cableMovement);
    document.removeEventListener("mouseup", this.cableUp);
  }
  cableMovement = e => {
    if (this.state.draggingCable) {
      this.setState({
        draggingCable: Object.assign({}, this.state.draggingCable, {
          location: { x: e.clientX - 10, y: e.clientY - 10 }
        })
      });
    }
  };
  cableUp = e => {
    if (this.state.draggingCable) {
      if (e.target.classList.contains("cable")) {
        const cableComponents = this.state.cables.reduce((prev, next) => {
          return prev.concat(next.components);
        }, []);
        if (cableComponents.indexOf(e.target.dataset.component) > -1) {
          this.setState({ draggingCable: null });
          return;
        }
        if (this.state.draggingCable.component) {
          this.setState({
            cables: this.state.cables.concat({
              id: uuid.v4(),
              color: this.state.draggingCable.color,
              components: [
                this.state.draggingCable.component,
                e.target.dataset.component
              ]
            })
          });
          this.setState({ draggingCable: null });
        } else {
          this.setState({
            draggingCable: Object.assign({}, this.state.draggingCable, {
              component: e.target.dataset.component
            })
          });
        }
      } else {
        this.setState({ draggingCable: null });
      }
    }
  };
  mouseDown = (evt, component) => {
    this.setState({
      libraryShown: false,
      draggingComponent: component,
      componentLocation: {
        x: evt.clientX - 12,
        y: evt.clientY - 30
      }
    });
    document.addEventListener("mousemove", this.mouseMove);
    document.addEventListener("mouseup", this.mouseUp);
  };
  mouseMove = evt => {
    const loc = this.state.componentLocation;
    this.setState({
      componentLocation: {
        x: loc.x + evt.movementX,
        y: loc.y + evt.movementY
      }
    });
  };
  mouseUp = () => {
    document.removeEventListener("mousemove", this.mouseMove);
    document.removeEventListener("mouseup", this.mouseUp);
    const {
      components,
      componentLocation: loc,
      draggingComponent
    } = this.state;
    this.setState({
      draggingComponent: null
    });
    if (
      loc.x < 0 ||
      loc.y < 0 ||
      loc.x > window.innerWidth ||
      loc.y > window.innerHeight
    )
      return;
    const comp = {
      id: uuid.v4(),
      component: draggingComponent,
      x: loc.x / window.innerWidth,
      y: loc.y / window.innerHeight
    };
    this.setState({
      components: components.concat(comp)
    });
  };
  updateComponent = component => {
    this.setState(({ components }) => {
      return {
        components: components.map(c => {
          if (c.id === component.id) return Object.assign({}, c, component);
          return c;
        })
      };
    });
  };
  removeComponent = id => {
    this.setState(({ components }) => {
      return { components: components.filter(c => c.id !== id) };
    });
  };
  startConnecting = (evt, id) => {
    evt.preventDefault();
    document.addEventListener("mousemove", this.moveConnection);
    document.addEventListener("mouseup", this.endConnection);
    this.setState({
      connectingFrom: id,
      connectingLocation: {
        x: evt.clientX,
        y: evt.clientY
      }
    });
  };
  moveConnection = evt => {
    this.setState({
      connectingLocation: {
        x: evt.clientX,
        y: evt.clientY
      }
    });
  };
  endConnection = evt => {
    document.removeEventListener("mousemove", this.moveConnection);
    document.removeEventListener("mouseup", this.endConnection);
    const connections = evt.target.dataset.component
      ? this.state.connections.concat({
          id: uuid.v4(),
          to: evt.target.dataset.component,
          from: this.state.connectingFrom
        })
      : this.state.connections;
    this.setState({
      connectingFrom: null,
      connections
    });
  };
  selectLine = id => {
    this.setState({ selectedLine: id });
  };
  delete = () => {
    if (this.state.selectedLine) {
      this.setState(prevState => ({
        connections: prevState.connections.filter(
          c => c.id !== prevState.selectedLine
        ),
        selectedLine: null
      }));
    }
  };
  dragCable = color =>
    this.setState({
      draggingCable: {
        color,
        location: {
          x: 0,
          y: 0
        }
      }
    });
  render() {
    const {
      components,
      libraryShown,
      componentLocation,
      draggingComponent,
      connectingFrom,
      connectingLocation,
      connections,
      selectedLine,
      edit,
      draggingCable,
      cables
    } = this.state;
    return (
      <div className="software-panels">
        <Link to={"/"}>Go Back</Link>
        {edit && (
          <Button
            size="sm"
            style={{ position: "absolute", left: "200px", zIndex: 2 }}
            onClick={() => this.setState({ libraryShown: true })}
          >
            Show
          </Button>
        )}
        <Button
          size="sm"
          style={{ position: "absolute", zIndex: 2 }}
          onClick={() => this.setState({ edit: !edit })}
        >
          {edit ? "Play" : "Edit"}
        </Button>
        {selectedLine && (
          <Button
            size="sm"
            style={{ position: "absolute", zIndex: 2 }}
            onClick={this.delete}
          >
            Delete
          </Button>
        )}
        <div className="componentCanvas">
          {draggingCable &&
            (draggingCable.location.x !== 0 &&
              draggingCable.location.y !== 0) && (
              <div
                className={`ready-cable ${draggingCable.color} dragger`}
                style={{
                  transform: `translate(${draggingCable.location.x}px, ${
                    draggingCable.location.y
                  }px)`
                }}
              />
            )}

          <svg className="connectors">
            {draggingCable &&
              draggingCable.component && (
                <DraggingLine
                  components={components}
                  connectingFrom={draggingCable.component}
                  color={draggingCable.color}
                  stroke={4}
                  loc={draggingCable.location}
                />
              )}
            {cables.map(c => (
              <DraggingLine
                key={c.id}
                components={components}
                connectingFrom={c.components[0]}
                connectingTo={c.components[1]}
                color={c.color}
                stroke={4}
              />
            ))}
            {edit &&
              connectingFrom && (
                <DraggingLine
                  components={components}
                  connectingFrom={connectingFrom}
                  loc={connectingLocation}
                />
              )}
            {edit &&
              connections.map(c => (
                <DraggingLine
                  key={c.id}
                  id={c.id}
                  selected={selectedLine === c.id}
                  onClick={this.selectLine}
                  components={components}
                  connectingFrom={c.from}
                  connectingTo={c.to}
                />
              ))}
          </svg>

          {components.map(c => (
            <PageComponent
              key={c.id}
              {...c}
              edit={edit}
              cables={cables}
              draggingCable={draggingCable}
              components={components}
              update={this.updateComponent}
              remove={() => this.removeComponent(c.id)}
              connecting={connectingFrom}
              connections={connections
                .filter(conn => conn.to === c.id)
                .map(conn => components.find(comp => comp.id === conn.from))}
              startConnecting={evt => this.startConnecting(evt, c.id)}
              dragCable={this.dragCable}
            />
          ))}

          {draggingComponent &&
            (() => {
              const Comp = Components[draggingComponent];
              return (
                <div
                  style={{
                    transform: `translate(${componentLocation.x}px, ${
                      componentLocation.y
                    }px)`
                  }}
                >
                  <Comp />
                </div>
              );
            })()}
        </div>
        <ComponentLibrary
          mouseDown={this.mouseDown}
          shown={libraryShown}
          hide={() => this.setState({ libraryShown: false })}
        />
      </div>
    );
  }
}

export default App;
