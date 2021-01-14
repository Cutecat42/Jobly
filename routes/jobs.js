"use strict";

/** Routes for jobs. */

const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, isAdmin } = require("../middleware/auth");
const Job = require("../models/job");

// const companyNewSchema = require("../schemas/companyNew.json");
// const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle}
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", isAdmin, async function (req, res, next) {
  try {
    const maxId = await Job.maxId
    console.log(maxId, "HI")
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { jobs: [ { title, salary, equity, company_handle}, ...] }
 *
 * Can filter on provided search filters:
 * - minSalary
 * - hasEquity
 * - titleLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const jobs = await Job.findAll(req.body.title, req.body.minSalary, req.body.hasEquity);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { job }
 *
 *  Job is { title, salary, equity, company_handle }
 *   where company is [{ company_handle }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    const jobs = await Job.get(req.params.handle);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity}
 *
 * Returns { id, title, salary, equity, company_handle}
 *
 * Authorization required: isAdmin
 */

// *****************
// {
//     "error": {
//       "message": "bind message supplies 2 parameters, but prepared statement \"\" requires 1",
//       "status": 500
//     }
// }

router.patch("/:id", isAdmin, async function (req, res, next) {
  try {
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: isAdmin
 */

router.delete("/:id", isAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
