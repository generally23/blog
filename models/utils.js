const deleteProperties = (source, ...properties) => {
    properties.forEach(property => delete source[property]);
    return source;
}

const setUniqueAndRequired = msg => ({
    required: [true, msg.re],
    unique: [true, msg.un]
});

module.exports = exports;