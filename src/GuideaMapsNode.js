import React from 'react';
import PropTypes from 'prop-types';
import {ItemTypes, NodeTypes} from './Constants';
import {DragSource, DropTarget} from 'react-dnd';
import flow from 'lodash/flow';

import './css/App.css';
import {NodeWidth, NodeHeight} from './Constants';
import AddChildButton from './AddChildButton';
import EditButton from './EditButton';
import ExpandCollapseButton from './ExpandCollapseButton';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const nodeSource = {
  beginDrag(props, monitor, component) {
    console.log(monitor.getItem());
    return {
      nodeId: props.id,
    };
  },
  endDrag(props, monitor, component) {
    console.log(props);
    console.log(monitor);
    console.log(component);
    let newPositions = monitor.getClientOffset();
    console.log(newPositions);
  },
};

const nodeTarget = {
  drop(props, monitor) {
    console.log(props);
    console.log(monitor);
  },
};

function dragCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

function dropCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

class GuideaMapsNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allChildren: [],
    };

    this.getAllChildren = this.getAllChildren.bind(this);
  }

  /**
   * A {@param node} is defined as complete if both "title"- and "content"-fields
   * are filled in.
   * @param node
   * @return {boolean}
   */
  static completeNode(node) {
    return node.title !== '' && node.content !== '';
  }

  /**
   * A helper function for {@see completenessIcon}
   * to get all the children of a {@param node}.
   * @param node: the node of which we want all children
   * @param result: the result is built into the array in this argument
   * @return {Array}: an array with all children of the {@param node}
   */
  getAllChildren(node, result = []) {
    if (node.children === undefined) {
      return result;
    } else {
      for (let i = 0; i < node.children.length; i++) {
        let child = node.children[i];
        result.push(child);
        this.getAllChildren(child, result);
      }
      return result;
    }
  }

  /**
   * A helper function for {@see completenessIcon} to check the completeness
   * of the children of a {@param node}.
   * @param node: the node of which we will check the children for completeness
   * @return {boolean}: the children are complete (true) or not (false)
   */
  completeChildren(node) {
    if (node.children === undefined) {
      return true;
    } else {
      // run over all children
      let children = this.getAllChildren(node);
      for (let i = 0; i < children.length; i++) {
        let child = children[i];
        // When an incomplete node is detected, false is immediately returned
        if (!GuideaMapsNode.completeNode(child)) {
          return false;
        }
      }
      // All nodes are complete => return true
      return true;
    }
  }

  /**
   * Check what the completenss-icon should look like. If the node itself and all
   * children are completed, a solid filled circle should be visible.
   * Otherwise (if the node and/or one or more of its children is incomplete),
   * a half filled circle should be visible.
   * @param node: the node to check for completeness
   * @return {string[]}: the specifications of the icon
   */
  completenessIcon(node) {
    switch (node.data.type) {
      case NodeTypes.CHOICE:
        return ['fas', 'circle'];
      default:
        // default node
        if (GuideaMapsNode.completeNode(node)) {
          // The node itself is complete, now check the children
          if (this.completeChildren(node)) {
            // Complete children
            return ['fas', 'circle'];
          } else {
            // At least one of the children is incomplete
            return ['fas', 'adjust'];
          }
        } else {
          return ['fas', 'adjust'];
        }
    }
  }

  /**
   * To render a node, a div element is created.
   * Inside this div we have another div to display the title of the node + a second div showing the content of it.
   * The last div is responsible for the interactions:
   * - Adding a child node
   * - Edit the current node
   * - Expand or collapse the current node to show or hide the child nodes (only visible if the node does have children)
   * */
  render() {
    const {
      node,
      updateShowChildren,
      addChildNode,
      //updatePosition,
      updateData,
      updateBackgroundColor, // passed by the renderNodes-function in ZoomableTree.js
      //connectDragSource,
      //connectDropTarget,
      isDragging, // injected by react dnd
      onClick,
      centered,
    } = this.props;
    //console.log(this.getAllChildren(node, []));
    switch (node.data.type) {
      case NodeTypes.CHOICE:
        return (
          //connectDragSource(connectDropTarget(
          <div
            ref={'node' + node.id}
            key={node.title}
            className={
              'node absolute ' +
              'border border-solid border-black rounded ' +
              'hover:border-red ' +
              'p-2 '
            }
            style={{
              width: NodeWidth,
              height: NodeHeight / 2,
              transform: `translate(
                              ${node.x}px,
                              ${node.y + NodeHeight / 4}px)`,
              display: node.show ? 'block' : 'none',
              backgroundColor: node.backgroundColor,
              opacity: isDragging ? 0.5 : 1,
              transition: centered && 'all 500ms ease 0s',
            }}
            onClick={onClick}>
            <div
              style={{
                color: node.backgroundColor,
                filter:
                  'invert(100%) saturate(0%) brightness(100%) contrast(1000%)',
                '-moz-osx-font-smoothing': 'grayscale', // used to avoid "boldlike" font
                '-webkit-font-smoothing': 'antialiased', // used to avoid "boldlike" font
              }}>
              <FontAwesomeIcon
                className={'absolute pin-r'}
                icon={this.completenessIcon(node)}
              />
              NodeType 2
            </div>
          </div>
        );
      //),
      //);
      default:
        // node.data.type === NodeTypes.DEFAULT
        return (
          //connectDragSource(connectDropTarget(
          <div
            key={node.title}
            className={
              'node absolute ' +
              'border border-solid border-black rounded ' +
              'hover:border-red '
            }
            style={{
              width: NodeWidth,
              height: NodeHeight,
              transform: `translate(${node.x}px, ${node.y}px)`,
              display: node.show ? 'block' : 'none',
              color: node.backgroundColor,
              opacity: isDragging ? 0.5 : 1,
              transition: centered && 'all 500ms ease 0s',
            }}
            onClick={onClick}>
            <div
              className={'rounded'}
              style={{backgroundColor: node.backgroundColor}}>
              <div // title div
                className={'flex pb-1 pt-1 pl-2 pr-2 rounded-t'}
                style={{
                  borderBottom: '1px solid',
                  borderColor: 'black',
                  color: 'black',
                  backgroundColor: 'white',
                }}>
                <div
                  className={'w-5/6 font-sans text-lg overflow-hidden'}
                  style={{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    //textAlign: 'center',
                  }}>
                  {node.title === '' ? 'No title' : node.title}
                </div>
                <div className={'w-1/6'}>
                  <FontAwesomeIcon
                    icon={this.completenessIcon(node)}
                    style={{fontSize: '18px'}}
                  />
                </div>
              </div>
              <div // content div
                className={
                  'font-sans text-base pl-2 pr-2 pt-1 pb-1 overflow-hidden invertColors'
                }
                style={{
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  color: node.backgroundColor, // this is inverted by the invertColors-class
                  height: '2.6em',
                }}>
                {node.content === '' ? 'No content' : node.content}
              </div>
              <div // controls div
                className={'flex rounded-b'}
                style={{backgroundColor: node.backgroundColor}}>
                <AddChildButton
                  width={node.height !== 0 ? 'w-1/3' : 'w-1/2'}
                  node={node}
                  addChildNode={addChildNode}
                  bgcolor={node.backgroundColor}
                />
                <EditButton
                  width={node.height !== 0 ? 'w-1/3' : 'w-1/2'}
                  node={node}
                  leaf={node.height === 0}
                  updateData={updateData}
                  updateBackgroundColor={updateBackgroundColor}
                  bgcolor={node.backgroundColor}
                />
                {node.height !== 0 && (
                  // At non-child nodes the expand-collapse button should be added
                  <ExpandCollapseButton
                    width={'w-1/3'}
                    node={node}
                    update={updateShowChildren}
                    bgcolor={node.backgroundColor}
                  />
                )}
              </div>
            </div>
          </div>
        );
      //),);
    }
  }
}

GuideaMapsNode.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
};

export default flow(
  DragSource(ItemTypes.NODE, nodeSource, dragCollect),
  DropTarget(ItemTypes.NODE, nodeTarget, dropCollect),
)(GuideaMapsNode);
