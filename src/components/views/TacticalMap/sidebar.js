import React, { Component } from "react";
import { TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import gql from "graphql-tag";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

const SortableItem = SortableElement(({ item, selectedLayer, selectLayer }) => (
  <li
    onMouseDown={() => selectLayer(item)}
    className={`${item.id === selectedLayer ? "selected" : ""} list-group-item`}
  >
    {item.name}
  </li>
));

const SortableList = SortableContainer(
  ({ items, selectedLayer, selectLayer }) => {
    return (
      <ul style={{ padding: 0 }}>
        {items.map((item, index) => {
          return (
            <SortableItem
              key={`${item.id}-layer`}
              index={index}
              item={item}
              selectedLayer={selectedLayer}
              selectLayer={selectLayer}
            />
          );
        })}
      </ul>
    );
  }
);
export default class Sidebar extends Component {
  state = { activeTab: "1" };
  toggle = tab => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  };
  addTactical = () => {
    const name = prompt("What is the name of the new tactical map?");
    if (name) {
      const mutation = gql`
        mutation NewTactical($name: String!) {
          newTacticalMap(name: $name)
        }
      `;
      const variables = { name };
      this.props.client.mutate({
        mutation,
        variables
      });
    }
  };
  addLayer = () => {
    const name = prompt("What is the name of the new layer?");
    if (name) {
      const mutation = gql`
        mutation NewLayer($mapId: ID!, $name: String!) {
          addTacticalMapLayer(mapId: $mapId, name: $name)
        }
      `;
      const variables = { mapId: this.props.tacticalMapId, name };
      this.props.client.mutate({
        mutation,
        variables
      });
    }
  };
  onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const mutation = gql`
        mutation ReorderTacticalLayer($mapId: ID!, $layer: ID!, $order: Int!) {
          reorderTacticalMapLayer(mapId: $mapId, layer: $layer, order: $order)
        }
      `;
      const selectedTactical = this.props.tacticalMaps.find(
        t => t.id === this.props.tacticalMapId
      );
      const variables = {
        mapId: this.props.tacticalMapId,
        layer: selectedTactical.layers[oldIndex].id,
        order: newIndex
      };
      this.props.client.mutate({
        mutation,
        variables
      });
    }
  };
  render() {
    const {
      tacticalMapId,
      layerId,
      tacticalMaps,
      selectTactical,
      selectLayer
    } = this.props;
    const { activeTab } = this.state;
    const selectedTactical = tacticalMaps.find(t => t.id === tacticalMapId);
    return (
      <div>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={activeTab === "1" ? "active" : ""}
              onClick={() => {
                this.toggle("1");
              }}
            >
              Layers
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === "2" ? "active" : ""}
              onClick={() => {
                this.toggle("2");
              }}
            >
              Saved Tacticals
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          {tacticalMapId && (
            <TabPane tabId="1">
              <h3>{selectedTactical.name}</h3>
              <p>Layers</p>
              <div className="layer-list">
                <SortableList
                  items={selectedTactical.layers}
                  onSortEnd={this.onSortEnd}
                  selectedLayer={layerId}
                  selectLayer={l => selectLayer(l.id)}
                />
              </div>

              <Button color="success" size="sm" onClick={this.addLayer}>
                Add Layer
              </Button>
              <Button color="warning" size="sm">
                Clear Tactical
              </Button>
            </TabPane>
          )}
          <TabPane tabId="2">
            <p>Saved Maps</p>
            <ul className="saved-list">
              {tacticalMaps.filter(t => t.template).map(t => (
                <li
                  key={t.id}
                  className={t.id === tacticalMapId ? "selected" : ""}
                  onClick={() => selectTactical(t.id)}
                >
                  {t.name}
                </li>
              ))}
            </ul>
            {this.props.dedicated && (
              <div>
                <Button color="success" size="sm" onClick={this.addTactical}>
                  New Map
                </Button>
                <Button color="info" size="sm">
                  Duplicate Map
                </Button>
              </div>
            )}
            {!this.props.dedicated && (
              <div>
                <p>Flight Maps</p>
                <ul className="saved-list">
                  {tacticalMaps.filter(t => !t.template).map(t => (
                    <li
                      key={t.id}
                      className={t.id === tacticalMapId ? "selected" : ""}
                      onClick={() => selectTactical(t.id)}
                    >
                      {t.name}
                    </li>
                  ))}
                </ul>
                <Button color="success" size="sm">
                  Save as Template Map
                </Button>
              </div>
            )}
          </TabPane>
        </TabContent>
      </div>
    );
  }
}
