import React, {Component} from 'react'
import { Control, Errors, LocalForm } from 'react-redux-form';
import Graph from 'react-vis-network-graph'
import { Modal, ModalBody, ModalHeader, Label, Col, Row, Button } from 'reactstrap';
import './styles.css'
 
const success = 'Articulation points are : ';
const failed = 'There is no articulation point :<';
let result = success;


class Main extends Component {

  constructor(props){
      super(props);
      this.createNode = this.createNode.bind(this);
      this.toggleModal = this.toggleModal.bind(this);
      this.addEdge = this.addEdge.bind(this);
      this.APUtil = this.APUtil.bind(this);
      this.AP = this.AP.bind(this);

      this.state={
        time: 0,
        NIL: -1,
        isModalOpen: false,  
        currentId : 1,  
        nodes: [
        ],
        edges: [
        ]

      }
  }
  
  toggleModal(){
    this.setState({isModalOpen: !this.state.isModalOpen});
  }

  createNode(){
    const newNode = {id : this.state.currentId, label : 'Node '+this.state.currentId, title : 'Node '+this.state.currentId, color : "#50A9E1"}; 
    this.setState({nodes: [...this.state.nodes, newNode]});
    this.setState({currentId: this.state.currentId + 1}, () => {
        console.log(this.state);
    });
  }

  APUtil(u, visited, disc, low, parent, ap){
      // Count of children in DFS Tree
      let children = 0;

      // Mark the current node as visited
      visited[u] = true;

      // Initialize discovery time and low value
      this.setState({time: this.state.time++});
      disc[u] = low[u] = this.state.time;

      // Go through all vertices adjacent to this
      const len = this.state.nodes.length;  
      let adj = new Array(len);
      for(let i=0; i<len; i++){
        adj[i] = new Array();
      }
      for(let i=0; i<this.state.edges.length; i++){
          adj[this.state.edges[i].from-1].push(this.state.edges[i].to-1);
      }

      for(let i=0; i<adj[u].length; i++){
          let v = adj[u][i]; // v is current adjacent of u

          // If v is not visited yet, then make it a child of u
          // in DFS tree and recur for it
          if (!visited[v])
          {
              children++;
              parent[v] = u;
              this.APUtil(v, visited, disc, low, parent, ap);
              // Check if the subtree rooted with v has a connection to
              // one of the ancestors of u
              low[u] = Math.min(low[u], low[v]);

              // u is an articulation point in following cases

              // (1) u is root of DFS tree and has two or more children.
              if (parent[u] == this.state.NIL && children > 1)
                  ap[u] = true;

              // (2) If u is not root and low value of one of its child
              // is more than discovery value of u.
              if (parent[u] != this.state.NIL && low[v] >= disc[u])
                  ap[u] = true;
          }

          // Update low value of u for parent function calls.
          else if (v != parent[u])
              low[u] = Math.min(low[u], disc[v]);
      }
  }

  async AP(){
    const len = this.state.nodes.length;  
    // Mark all the vertices as not visited
    let visited = new Array(len);
    let disc = new Array(len);
    let low = new Array(len);
    let parent = new Array(len);
    let ap = new Array(len); // To store articulation points

    // Initialize parent and visited, and ap(articulation point)
    // arrays
    for (let i = 0; i < len; i++)
    {
        parent[i] = this.state.NIL;
        visited[i] = false;
        ap[i] = false;
    }

    // Call the recursive helper function to find articulation
    // points in DFS tree rooted with vertex 'i'
    for (let i = 0; i < len; i++)
        if (visited[i] == false)
            this.APUtil(i, visited, disc, low, parent, ap);

    // Now ap[] contains articulation points, print them
    for (let i = 0; i < len; i++){
        if (ap[i] == true){
            // let nodes = [...this.state.nodes];
            // nodes[i].color = "#FF5757";
            // this.setState({nodes: [...nodes]});
            let j=i+1;
            await this.setState(prevState => {
                const nodes = prevState.nodes.filter(node => node.id !== j);
                return { nodes };
            });
            const newNode = {id : j, label : 'Node '+j, title : 'Node '+j, color : "#FF5757"}; 
            await this.setState({nodes: [...this.state.nodes, newNode]});
            console.log(this.state.nodes);
            result = result + j + ', ';
        }
    }

    if(result == success){
        document.getElementById('result').innerHTML = failed;
    }else{ 
        result = result.slice(0, -2);
        document.getElementById('result').innerHTML = result;
    }
  }

  addEdge(values, e){
    e.preventDefault();
    let newEdgeOne = {from: values.firstnode, to:values.secondnode};
    let newEdgeTwo = {from: values.secondnode, to:values.firstnode};
    this.setState({edges: [...this.state.edges, newEdgeOne, newEdgeTwo]});
    this.toggleModal();
  }

  render(){
    const required = (val) => val && val.length;
    const nodeValidate = (val) => val > 0 && val<= this.state.nodes.length;
    const otherNode = (val) => val != document.getElementById('firstnode').value; 

    const options = {
        layout: {
          hierarchical: false
        },
        edges: {
          color: "#50A9E1"
        },
        height: "500px"
    };
     
    const events = {
        select: function(event) {
            var { nodes, edges } = event;
        },
    };

    const graph = {
        nodes : this.state.nodes,
        edges : this.state.edges
    }
    console.log('re-rendred');  
    return (
        <div className="main-container">
           <div className="container">
           <Graph
                graph={graph}
                options={options}
                events={events}
                getNetwork={network => {
                    //  if you want access to vis.js network api you can set the state in a parent component using this property
                }}
            />
            <div className="mt-2">
                <div className="row m-auto">
                    <div className="col-2 offset-1">
                        <button type="button" className="btn btn-primary" onClick={this.createNode}>Add New Node</button>
                    </div>
                    <div className="col-3 offset-1">
                        <button type="button" className="btn btn-outline-primary" onClick={this.AP}>Show the articulation points</button>
                    </div>
                    <div className="col-3 offset-1">
                        <button type="button" className="btn btn-primary" onClick={this.toggleModal}>Add New Edge</button> 
                    </div>
                </div>
            </div>
            <div className="row mt-5">
                <h3 id="result" className="text-light text-center"></h3>
            </div>
            <Modal isOpen={this.state.isModalOpen} toggle={this.toggleModal}>
               <ModalHeader toggle={this.toggleModal}>ADD NEW EDGE</ModalHeader>
               <ModalBody>
                  <LocalForm onSubmit={(values, e)=>this.addEdge(values, e)}>
                            <Row className={"mb-3 form-group"}>
                                <Label htmlFor="firstnode" className={"text-dark mb-2"}>First Node :</Label>
                                <Col>
                                    <Control type="number" model='.firstnode' id='firstnode' name='firstnode' placeholder='First Node' 
                                    className='form-control'
                                    validators={{
                                        required,
                                        nodeValidate
                                    }}
                                    />
                                    <Errors className={"text-danger"} model=".firstnode" show="touched" 
                                    messages={{
                                      required: ' | Required',
                                      nodeValidate: ' | This node don\'t exist in the graph'
                                    }}/>
                                </Col>
                            </Row>
                            <Row className={"mb-3 form-group"}>
                                <Label htmlFor="secondnode" className={"text-dark mb-2"}>Second Node :</Label>
                                <Col>
                                    <Control type="number" model='.secondnode' id='secondnode' name='secondnode' placeholder='Second Node' 
                                    className='form-control'
                                    validators={{
                                        required,
                                        nodeValidate,
                                        otherNode
                                    }}
                                    />
                                    <Errors className={"text-danger"} model=".secondnode" show="touched" 
                                    messages={{
                                      required: ' | Required',
                                      nodeValidate: ' | This node don\'t exist in the graph',
                                      otherNode: 'Please select other node'
                                    }}/>
                                </Col>
                            </Row>
                            <Row className="form-group">
                                <Col xs={12}>
                                   <Button className={"col-6"} type="submit" color="primary">ADD</Button>
                                </Col>
                            </Row>
                  </LocalForm>
               </ModalBody>
            </Modal>
           </div> 
        </div>
    );
  }
}

export default Main;