exports.createOne = (Model, data) => {
    return new Model(data);
}

exports.findOne = async (Model, filters, option) => {
    return await Model.findOne(filters).select(option);
}

// exports.updatOne = async (Model, id) => {
//     const item = await Model.findById(id);
//     return item;
// }

exports.removeOne = async (Model, filters) => {
    await Model.deleteOne(filters);
}

exports.findAll = async Model => {
    const result = await Model.find();
    return result;
}

exports.removeAll = async Model => {
    await Model.deleteMany();
}

module.exports = exports;