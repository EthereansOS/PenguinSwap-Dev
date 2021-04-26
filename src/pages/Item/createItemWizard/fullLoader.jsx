import React from 'react'
import createReactClass from 'create-react-class'

const loadMonolith = require('./loadMonolith.png');

export default createReactClass({
    render() {
        return(
        <section className="LoaderFull">
            <figure className="LoadImg">
                <img src={loadMonolith}/>
            </figure>
        </section>);
    }
});