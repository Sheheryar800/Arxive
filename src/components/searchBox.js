import React from 'react'

class Search extends React.Component{
    render(){
        return(
            <input
              name="fname"
              type="text"
              value="tahir"
            //   value={this.state.fname}
            //   onChange={this.onInputchange}
            />
        )
    }
}
export default Search